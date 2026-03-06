import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp,
  getCountFromServer 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface DashboardStats {
  monthlyRevenue: {
    current: number;
    previous: number;
    growth: number;
  };
  totalOrders: {
    count: number;
    growth: number;
  };
  activeProducts: {
    count: number;
    lowStock: number;
  };
  activeParties: {
    count: number;
    recent: number;
  };
  averageOrderValue: number;
  conversionRate: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>;
  topParties: Array<{ id: string; name: string; orders: number; totalSpent: number }>;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Dashboard API: Fetching dashboard data...');
    
    // Calculate date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    console.log('Date ranges:', { currentMonthStart, previousMonthStart, previousMonthEnd });
    
    // Fetch data in parallel - simplified queries without composite indexes
    const [
      allInvoices,
      invoiceCount,
      totalProducts,
      lowStockProducts,
      totalParties,
      recentParties
    ] = await Promise.allSettled([
      // All invoices (will filter in code)
      getDocs(query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc'),
        limit(1000)
      )),
      
      // Get total invoice count
      getCountFromServer(query(collection(db, 'invoices'))),
      
      // Total products count
      getCountFromServer(query(collection(db, 'products'))),
      
      // Low stock products (assuming quantity <= 10 is low stock)
      getDocs(query(
        collection(db, 'products'),
        where('quantity', '<=', 10),
        limit(1000)
      )),
      
      // Total parties count
      getCountFromServer(query(collection(db, 'parties'))),
      
      // Recent parties (last 30 days)
      getDocs(query(
        collection(db, 'parties'),
        where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
        orderBy('createdAt', 'desc'),
        limit(1000)
      ))
    ]);

    // Process results with fallback for failures
    const allInvoicesData = allInvoices.status === 'fulfilled' 
      ? allInvoices.value.docs 
      : [];
    
    const totalInvoiceCount = invoiceCount.status === 'fulfilled'
      ? invoiceCount.value.data().count
      : 0;
    
    console.log('Total invoices in collection:', totalInvoiceCount);
    console.log('Fetched invoices sample:', allInvoicesData.length);
    
    // Debug: Log first invoice to see structure
    if (allInvoicesData.length > 0) {
      const firstInvoice = allInvoicesData[0].data();
      console.log('First invoice structure:', {
        hasCreatedAt: 'createdAt' in firstInvoice,
        createdAtType: typeof firstInvoice.createdAt,
        createdAtValue: firstInvoice.createdAt,
        totalAmount: firstInvoice.totalAmount,
        total: firstInvoice.total,
        amount: firstInvoice.amount,
        date: firstInvoice.date
      });
    }
    
    // Filter invoices by date range in code
    const currentInvoices = allInvoicesData.filter(doc => {
      const invoiceData = doc.data();
      let createdAt: Date;
      
      if (invoiceData.createdAt?.toDate) {
        createdAt = invoiceData.createdAt.toDate();
      } else if (invoiceData.createdAt instanceof Date) {
        createdAt = invoiceData.createdAt;
      } else if (typeof invoiceData.createdAt === 'string') {
        createdAt = new Date(invoiceData.createdAt);
      } else if (invoiceData.date) {
        createdAt = new Date(invoiceData.date);
      } else {
        return false;
      }
      
      return createdAt >= currentMonthStart;
    });

    const prevInvoices = allInvoicesData.filter(doc => {
      const invoiceData = doc.data();
      let createdAt: Date;
      
      if (invoiceData.createdAt?.toDate) {
        createdAt = invoiceData.createdAt.toDate();
      } else if (invoiceData.createdAt instanceof Date) {
        createdAt = invoiceData.createdAt;
      } else if (typeof invoiceData.createdAt === 'string') {
        createdAt = new Date(invoiceData.createdAt);
      } else if (invoiceData.date) {
        createdAt = new Date(invoiceData.date);
      } else {
        return false;
      }
      
      return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
    });
    
    console.log('Invoices found:', { current: currentInvoices.length, previous: prevInvoices.length });
    
    const productsCount = totalProducts.status === 'fulfilled' 
      ? totalProducts.value.data().count 
      : 0;
    
    const lowStockCount = lowStockProducts.status === 'fulfilled' 
      ? lowStockProducts.value.docs.length 
      : 0;
    
    const partiesCount = totalParties.status === 'fulfilled' 
      ? totalParties.value.data().count 
      : 0;
    
    const recentPartiesCount = recentParties.status === 'fulfilled' 
      ? recentParties.value.docs.length 
      : 0;
    
    console.log('Counts:', { productsCount, lowStockCount, partiesCount, recentPartiesCount });

    // Calculate revenue - check multiple field names
    const currentMonthRevenue = currentInvoices.reduce((sum, doc, idx) => {
      const invoice = doc.data();
      const amount = invoice.totalAmount || invoice.total || invoice.amount || invoice.grandTotal || 0;
      const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
      if (idx < 3) {
        console.log(`Current invoice ${idx}:`, { amount, numAmount, fields: Object.keys(invoice).slice(0, 10) });
      }
      return sum + numAmount;
    }, 0);

    const previousMonthRevenue = prevInvoices.reduce((sum, doc) => {
      const invoice = doc.data();
      const amount = invoice.totalAmount || invoice.total || invoice.amount || invoice.grandTotal || 0;
      const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
      return sum + numAmount;
    }, 0);
    
    console.log('Revenue calculated:', { 
      currentMonthRevenue, 
      previousMonthRevenue,
      currentInvoiceCount: currentInvoices.length,
      previousInvoiceCount: prevInvoices.length
    });

    // Calculate growth rates
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;

    const ordersGrowth = prevInvoices.length > 0 
      ? ((currentInvoices.length - prevInvoices.length) / prevInvoices.length) * 100 
      : currentInvoices.length > 0 ? 100 : 0;

    // Calculate additional metrics
    const averageOrderValue = currentInvoices.length > 0 
      ? Math.round(currentMonthRevenue / currentInvoices.length)
      : 0;

    // Calculate revenue by month (last 6 months)
    const revenueByMonth: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthInvoices = allInvoicesData.filter(doc => {
        const invoiceData = doc.data();
        let createdAt: Date;
        
        if (invoiceData.createdAt?.toDate) {
          createdAt = invoiceData.createdAt.toDate();
        } else if (invoiceData.createdAt instanceof Date) {
          createdAt = invoiceData.createdAt;
        } else if (typeof invoiceData.createdAt === 'string') {
          createdAt = new Date(invoiceData.createdAt);
        } else if (invoiceData.date) {
          createdAt = new Date(invoiceData.date);
        } else {
          return false;
        }
        
        return createdAt >= monthDate && createdAt <= monthEnd;
      });
      
      const monthRevenue = monthInvoices.reduce((sum, doc) => {
        const invoice = doc.data();
        const amount = invoice.totalAmount || invoice.total || invoice.amount || invoice.grandTotal || 0;
        const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        return sum + numAmount;
      }, 0);
      
      revenueByMonth.push({
        month: monthDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: Math.round(monthRevenue)
      });
    }

    // Top products by revenue
    const productMap = new Map<string, { name: string; sales: number; revenue: number }>();
    currentInvoices.forEach(doc => {
      const invoice = doc.data();
      const items = invoice.items || [];
      items.forEach((item: any) => {
        const productId = item.productId || item.id || 'unknown';
        const productName = item.productName || item.name || 'Unknown';
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        const itemRevenue = quantity * price;
        
        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!;
          existing.sales += quantity;
          existing.revenue += itemRevenue;
        } else {
          productMap.set(productId, {
            name: productName,
            sales: quantity,
            revenue: itemRevenue
          });
        }
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p, i) => ({
        id: `product-${i}`,
        name: p.name,
        sales: p.sales,
        revenue: Math.round(p.revenue)
      }));

    // Top parties by spending
    const partiesMap = new Map<string, { name: string; orders: number; totalSpent: number }>();
    currentInvoices.forEach(doc => {
      const invoice = doc.data();
      const partyId = invoice.partyId || invoice.customerId || 'unknown';
      const partyName = invoice.partyName || invoice.customerName || 'Unknown';
      const amount = invoice.totalAmount || invoice.total || invoice.amount || invoice.grandTotal || 0;
      const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
      
      if (partiesMap.has(partyId)) {
        const existing = partiesMap.get(partyId)!;
        existing.orders += 1;
        existing.totalSpent += numAmount;
      } else {
        partiesMap.set(partyId, {
          name: partyName,
          orders: 1,
          totalSpent: numAmount
        });
      }
    });

    const topParties = Array.from(partiesMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map((p, i) => ({
        id: `party-${i}`,
        name: p.name,
        orders: p.orders,
        totalSpent: Math.round(p.totalSpent)
      }));

    // Prepare dashboard stats
    const stats: DashboardStats = {
      monthlyRevenue: {
        current: Math.round(currentMonthRevenue),
        previous: Math.round(previousMonthRevenue),
        growth: Math.round(revenueGrowth * 100) / 100
      },
      totalOrders: {
        count: currentInvoices.length,
        growth: Math.round(ordersGrowth * 100) / 100
      },
      activeProducts: {
        count: productsCount,
        lowStock: lowStockCount
      },
      activeParties: {
        count: partiesCount,
        recent: recentPartiesCount
      },
      averageOrderValue,
      conversionRate: 0,
      revenueByMonth,
      topProducts,
      topParties
    };

    console.log('📊 Dashboard stats calculated:', {
      revenue: stats.monthlyRevenue.current,
      orders: stats.totalOrders.count,
      products: stats.activeProducts.count,
      parties: stats.activeParties.count
    });

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      metadata: {
        currentMonth: currentMonthStart.toISOString().substring(0, 7),
        dataPoints: currentInvoices.length + prevInvoices.length + productsCount + partiesCount
      }
    });

  } catch (error: any) {
    console.error('❌ Dashboard API Error:', error);
    
    // Return fallback data instead of error
    const fallbackStats: DashboardStats = {
      monthlyRevenue: {
        current: 0,
        previous: 0,
        growth: 0
      },
      totalOrders: {
        count: 0,
        growth: 0
      },
      activeProducts: {
        count: 0,
        lowStock: 0
      },
      activeParties: {
        count: 0,
        recent: 0
      },
      averageOrderValue: 0,
      conversionRate: 0,
      revenueByMonth: [],
      topProducts: [],
      topParties: []
    };

    return NextResponse.json({
      success: false,
      data: fallbackStats,
      error: 'Failed to fetch dashboard data',
      details: error.message,
      timestamp: new Date().toISOString(),
      fallback: true
    }, { status: 200 }); // Return 200 with fallback data instead of 500
  }
}