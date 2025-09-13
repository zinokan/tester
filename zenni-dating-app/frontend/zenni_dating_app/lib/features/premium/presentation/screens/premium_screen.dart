import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});

  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  int _selectedPlan = 1; // 0: Plus, 1: Gold, 2: Platinum

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Zenni Premium'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(
                      Icons.diamond,
                      size: 60,
                      color: Colors.amber,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Unlock Premium Features',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Get more matches and better dating experience',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Features
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Premium Features',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildFeatureItem(Icons.favorite, 'Unlimited Likes'),
                    _buildFeatureItem(Icons.star, 'Super Likes'),
                    _buildFeatureItem(Icons.visibility, 'See Who Liked You'),
                    _buildFeatureItem(Icons.travel_explore, 'Passport'),
                    _buildFeatureItem(Icons.refresh, 'Rewind'),
                    _buildFeatureItem(Icons.ads_click, 'Ad-Free Experience'),
                    _buildFeatureItem(Icons.analytics, 'Read Receipts'),
                    _buildFeatureItem(Icons.priority_high, 'Priority Likes'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Pricing Plans
            const Text(
              'Choose Your Plan',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            // Plus Plan
            _buildPlanCard(
              title: 'Zenni Plus',
              price: '\$9.99',
              period: '/month',
              features: [
                'Unlimited Likes',
                '5 Super Likes per day',
                'Rewind',
                'Passport',
                'Ad-Free',
              ],
              isSelected: _selectedPlan == 0,
              onTap: () => setState(() => _selectedPlan = 0),
            ),
            const SizedBox(height: 12),
            
            // Gold Plan
            _buildPlanCard(
              title: 'Zenni Gold',
              price: '\$29.99',
              period: '/month',
              features: [
                'Everything in Plus',
                'See Who Liked You',
                'Top Picks',
                '10 Super Likes per day',
                'Read Receipts',
              ],
              isSelected: _selectedPlan == 1,
              onTap: () => setState(() => _selectedPlan = 1),
              isPopular: true,
            ),
            const SizedBox(height: 12),
            
            // Platinum Plan
            _buildPlanCard(
              title: 'Zenni Platinum',
              price: '\$39.99',
              period: '/month',
              features: [
                'Everything in Gold',
                'Message Before Match',
                'Priority Likes',
                '20 Super Likes per day',
                'Message Analytics',
              ],
              isSelected: _selectedPlan == 2,
              onTap: () => setState(() => _selectedPlan = 2),
            ),
            const SizedBox(height: 32),
            
            // Subscribe Button
            ElevatedButton(
              onPressed: _subscribe,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text(
                'Subscribe Now',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Terms
            Text(
              'By subscribing, you agree to our Terms of Service and Privacy Policy. Subscription will auto-renew unless cancelled.',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.green),
          const SizedBox(width: 12),
          Text(text),
        ],
      ),
    );
  }

  Widget _buildPlanCard({
    required String title,
    required String price,
    required String period,
    required List<String> features,
    required bool isSelected,
    required VoidCallback onTap,
    bool isPopular = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected ? Theme.of(context).primaryColor.withOpacity(0.1) : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Theme.of(context).primaryColor : null,
                    ),
                  ),
                ),
                if (isPopular)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'POPULAR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  price,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  period,
                  style: TextStyle(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...features.map((feature) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  const Icon(Icons.check, size: 16, color: Colors.green),
                  const SizedBox(width: 8),
                  Text(feature),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  void _subscribe() {
    // TODO: Implement subscription logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Subscription feature coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}