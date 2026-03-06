#!/bin/bash

echo "🚀 Deploying Essential Firestore Indexes"
echo "========================================"

# Backup existing indexes
if [ -f "firestore.indexes.json" ]; then
    echo "📋 Backing up existing indexes..."
    cp firestore.indexes.json firestore.indexes.json.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy new indexes
echo "📁 Installing new indexes..."
cp /Users/prakashseervi/Desktop/hanuam-kothur/generated-indexes/firestore.indexes.json firestore.indexes.json

# Show what will be deployed
echo "📊 About to deploy 83 indexes covering:"
echo "   • Products: 12 indexes"
echo "   • Parties: 7 indexes"
echo "   • Invoices: 11 indexes"
echo "   • Purchases: 7 indexes"
echo "   • Orders: 7 indexes"
echo "   • Categories: 4 indexes"
echo "   • Inventory: 6 indexes"
echo "   • And more..."

# Confirm deployment
read -p "Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Indexes deployed successfully!"
    echo "🔗 View in Firebase Console: https://console.firebase.google.com/"
    echo "📈 Monitor query performance in the Firestore section"
else
    echo "❌ Deployment failed! Check Firebase CLI setup and authentication"
    exit 1
fi
