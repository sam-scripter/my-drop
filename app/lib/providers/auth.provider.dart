// auth.provider.dart — Authentication state management
//
// Riverpod providers are like a global state store.
// Any screen can watch these providers and rebuild when they change.
// Think of it like a shared variable the whole app can read and write.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth.service.dart';
import '../services/api.service.dart';

// ── Service providers ─────────────────────────────────────────────────
// These make our services available throughout the app

final authServiceProvider = Provider<AuthService>((ref) => AuthService());
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

// ── Auth state ────────────────────────────────────────────────────────
// Holds the current user — null means not logged in

class AuthNotifier extends StateNotifier<UserModel?> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(null) {
    // Check if user is already logged in when app starts
    _loadStoredUser();
  }

  Future<void> _loadStoredUser() async {
    final user = await _authService.getCurrentUser();
    state = user;
  }

  Future<({UserModel user, BusinessModel business, bool mustChangePassword})> login({
    required String email,
    required String password,
  }) async {
    final result = await _authService.login(
      email: email,
      password: password,
    );
    state = result.user; // update state — triggers UI rebuild
    return result;
  }

  Future<void> logout() async {
    await _authService.logout();
    state = null; // clear state — triggers redirect to login
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, UserModel?>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

// ── Convenience getters ───────────────────────────────────────────────

final isLoggedInProvider = Provider<bool>((ref) {
  return ref.watch(authProvider) != null;
});

final isManagerProvider = Provider<bool>((ref) {
  return ref.watch(authProvider)?.isManager ?? false;
});

final isRiderProvider = Provider<bool>((ref) {
  return ref.watch(authProvider)?.isRider ?? false;
});
