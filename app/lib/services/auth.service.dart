// auth.service.dart — Manages login state and token storage
//
// This service is the single source of truth for authentication.
// It stores the JWT and user info securely on the device and
// provides methods to log in, log out, and check auth status.

import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants.dart';
import '../models/user.dart';
import 'api.service.dart';

class AuthService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final ApiService _api = ApiService();

  // ── Login ─────────────────────────────────────────────────────────

  Future<({UserModel user, BusinessModel business, bool mustChangePassword})>
      login({
    required String email,
    required String password,
  }) async {
    final data = await _api.login(email: email, password: password);

    // Store JWT token securely
    await _storage.write(key: AppConstants.tokenKey, value: data['token']);

    // Store user data for quick access without API calls
    await _storage.write(
      key: AppConstants.userKey,
      value: jsonEncode(data['user']),
    );

    final user = UserModel.fromJson(data['user']);
    final business = BusinessModel.fromJson(data['business']);
    final mustChangePassword = data['must_change_password'] == true;

    // Register FCM token so this device receives push notifications
    // Do this after login so we have the JWT ready to call the API
    _registerFcmToken();

    return (
      user: user,
      business: business,
      mustChangePassword: mustChangePassword
    );
  }

  // Runs in background — don't await, don't block login
  Future<void> _registerFcmToken() async {
    try {
      final messaging = FirebaseMessaging.instance;

      // Request permission (required on iOS, harmless on Android)
      await messaging.requestPermission();

      final token = await messaging.getToken();
      if (token != null) {
        await _api.updateFcmToken(token);
        print('FCM token registered: ${token.substring(0, 20)}...');
      }
    } catch (e) {
      // Don't fail login if FCM registration fails
      print('FCM token registration failed: $e');
    }
  }

  // ── Logout ────────────────────────────────────────────────────────
  Future<void> logout() async {
    await _storage.deleteAll();
  }

  // ── Check if logged in ────────────────────────────────────────────

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    return token != null;
  }

  // ── Get current user from storage ─────────────────────────────────
  // Used on app launch to restore session without re-logging in

  Future<UserModel?> getCurrentUser() async {
    final userJson = await _storage.read(key: AppConstants.userKey);
    if (userJson == null) return null;
    return UserModel.fromJson(jsonDecode(userJson));
  }

  Future<String?> getToken() async {
    return _storage.read(key: AppConstants.tokenKey);
  }
}
