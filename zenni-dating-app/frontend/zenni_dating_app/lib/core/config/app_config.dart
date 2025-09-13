class AppConfig {
  static const String appName = 'Zenni';
  static const String appVersion = '1.0.0';
  static const String apiBaseUrl = 'http://localhost:8080/api';
  static const String wsBaseUrl = 'ws://localhost:8080/ws';
  
  // API Endpoints
  static const String authEndpoint = '/auth';
  static const String discoveryEndpoint = '/discovery';
  static const String swipeEndpoint = '/swipe';
  static const String matchesEndpoint = '/matches';
  static const String messagesEndpoint = '/messages';
  
  // App Settings
  static const int maxPhotos = 9;
  static const int maxBioLength = 500;
  static const int maxDistance = 1000; // km
  static const int minAge = 18;
  static const int maxAge = 100;
  
  // Free User Limits
  static const int dailyLikes = 10;
  static const int dailySuperLikes = 1;
  
  // Premium Features
  static const int plusDailyLikes = -1; // unlimited
  static const int plusDailySuperLikes = 5;
  static const int goldDailySuperLikes = 10;
  static const int platinumDailySuperLikes = 20;
}