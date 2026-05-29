// router.dart — App navigation and route definitions
//
// This determines which screen to show based on:
// 1. Whether the user is logged in
// 2. Whether they are a manager or rider

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth.provider.dart';
import '../screens/auth/login.screen.dart';
import '../screens/manager/dashboard.screen.dart';
import '../screens/manager/orders.screen.dart';
import '../screens/manager/create_order.screen.dart';
import '../screens/rider/home.screen.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const AuthGate());
      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case '/manager/dashboard':
        return MaterialPageRoute(builder: (_) => const ManagerDashboardScreen());
      case '/manager/orders':
        return MaterialPageRoute(builder: (_) => const OrdersScreen());
      case '/manager/create-order':
        return MaterialPageRoute(builder: (_) => const CreateOrderScreen());
      case '/rider/home':
        return MaterialPageRoute(builder: (_) => const RiderHomeScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('Route ${settings.name} not found')),
          ),
        );
    }
  }
}

// AuthGate decides which screen to show on app launch
class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider);

    if (user == null) {
      return const LoginScreen();
    }

    // Route to the right home screen based on role
    if (user.isManager) {
      return const ManagerDashboardScreen();
    } else {
      return const RiderHomeScreen();
    }
  }
}