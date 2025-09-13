import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // TODO: Open settings
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.grey[300],
                      child: const Icon(
                        Icons.person,
                        size: 50,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'John Doe',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '25 years old',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () => context.go('/edit-profile'),
                      icon: const Icon(Icons.edit),
                      label: const Text('Edit Profile'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Menu Items
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.favorite),
                    title: const Text('My Likes'),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      // TODO: Navigate to likes
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.star),
                    title: const Text('Super Likes'),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      // TODO: Navigate to super likes
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.visibility),
                    title: const Text('Who Liked Me'),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      // TODO: Navigate to who liked me
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Premium Section
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.diamond, color: Colors.amber),
                    title: const Text('Zenni Plus'),
                    subtitle: const Text('Unlock premium features'),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () => context.go('/premium'),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.help),
                    title: const Text('Help & Support'),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      // TODO: Navigate to help
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.privacy_tip),
                    title: const Text('Privacy & Safety'),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      // TODO: Navigate to privacy
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.logout, color: Colors.red),
                    title: const Text('Sign Out'),
                    onTap: () {
                      // TODO: Sign out
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}