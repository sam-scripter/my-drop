// constants.dart — App-wide configuration constants
// Change API_BASE_URL when switching between local dev and production

class AppConstants {
  // ── API ─────────────────────────────────────────────────────────
  // Your backend URL — all API calls go here
  static const String apiBaseUrl = 'https://mydrop.duckdns.org/api';

  // ── Firestore ────────────────────────────────────────────────────
  // The collection path where riders write their live location
  // Matches the path in the backend: deliveries/{orderId}/location
  static const String firestoreDeliveriesCollection = 'deliveries';

  // ── Map defaults ─────────────────────────────────────────────────
  // Default map center — Nairobi CBD
  static const double defaultLat = -1.2921;
  static const double defaultLng = 36.8219;
  static const double defaultZoom = 13.0;

  // ── GPS ──────────────────────────────────────────────────────────
  // Only send a new GPS update after moving this many metres
  // 10m is a good balance between accuracy and battery/data usage
  static const int locationDistanceFilter = 10;

  // ── Token storage keys ───────────────────────────────────────────
  // Keys used to store/retrieve data from secure storage
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
}