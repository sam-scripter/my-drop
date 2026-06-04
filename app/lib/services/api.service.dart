// api.service.dart — HTTP client for all backend API calls
//
// Dio is like fetch/axios but for Flutter. We configure it once here
// with the base URL and auth token interceptor, then use it everywhere.

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants.dart';

class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    // ── Interceptor ────────────────────────────────────────────────
    // This runs before every request — automatically attaches the JWT
    // so we don't have to manually add it to every API call
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.tokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        // Log errors in development
        print(
            'API Error: ${error.response?.statusCode} ${error.requestOptions.path}');
        print('Response: ${error.response?.data}');
        handler.next(error);
      },
    ));
  }

  // ── Auth ──────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> register({
    required String businessName,
    required String businessPhone,
    required String businessEmail,
    required String managerName,
    required String password,
  }) async {
    final response = await _dio.post('/auth/register', data: {
      'businessName': businessName,
      'businessPhone': businessPhone,
      'businessEmail': businessEmail,
      'managerName': managerName,
      'password': password,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }

  // ── Orders ────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getOrders({
    String? status,
    int page = 1,
  }) async {
    final response = await _dio.get('/orders', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getOrder(String orderId) async {
    final response = await _dio.get('/orders/$orderId');
    return response.data;
  }

  Future<Map<String, dynamic>> createOrder({
    required String customerName,
    required String customerPhone,
    required String customerAddress,
    String? itemsDescription,
    String? notes,
  }) async {
    final response = await _dio.post('/orders', data: {
      'customer_name': customerName,
      'customer_phone': customerPhone,
      'customer_address': customerAddress,
      if (itemsDescription != null) 'items_description': itemsDescription,
      if (notes != null) 'notes': notes,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> assignRider({
    required String orderId,
    required String riderId,
  }) async {
    final response = await _dio.post('/orders/$orderId/assign', data: {
      'riderId': riderId,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> updateOrderStatus({
    required String orderId,
    required String status,
    String? pin,
  }) async {
    final response = await _dio.put('/orders/$orderId/status', data: {
      'status': status,
      if (pin != null) 'pin': pin,
    });
    return response.data;
  }

  // ── Users ─────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getRiders() async {
    final response = await _dio.get('/users/riders');
    return response.data;
  }

  Future<Map<String, dynamic>> createRider({
    required String name,
    required String phone,
    required String email,
  }) async {
    final response = await _dio.post('/users/rider', data: {
      'name': name,
      'phone': phone,
      'email': email,
    });
    return response.data;
  }

  Future<void> updateFcmToken(String token) async {
    await _dio.put('/users/fcm-token', data: {'fcm_token': token});
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _dio.put('/users/change-password', data: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  // ── Business ──────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getMyBusiness() async {
    final response = await _dio.get('/business/me');
    return response.data;
  }

  // ── Analytics ─────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getAnalyticsToday() async {
    final response = await _dio.get('/analytics/today');
    return response.data;
  }
}
