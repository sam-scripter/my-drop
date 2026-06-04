// main.dart — App entry point
// Sets up Firebase, Riverpod, and launches the app

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mydrop_app/screens/manager/dashboard.screen.dart';
import 'package:mydrop_app/screens/rider/home.screen.dart';
import 'core/router.dart';
import 'core/theme.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  // Ensures Flutter is initialized before we call any platform code
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(
    // ProviderScope is required by Riverpod — wraps the entire app
    // so all providers are accessible from any widget
    const ProviderScope(
      child: MyDropApp(),
    ),
  );
}

class MyDropApp extends StatelessWidget {
  const MyDropApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'mydrop',
      debugShowCheckedModeBanner: false, // removes the red DEBUG banner
      theme: AppTheme.lightTheme,
      onGenerateRoute: AppRouter.generateRoute,
      initialRoute: '/',
    );
  }
}
