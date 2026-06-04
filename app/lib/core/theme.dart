// theme.dart — App colors, fonts, and visual styling
// Centralising theme means changing one value updates the whole app

import 'package:flutter/material.dart';

class AppTheme {
  // ── Brand colors ─────────────────────────────────────────────────
  static const Color primary = Color(0xFF1A73E8); // mydrop blue
  static const Color primaryDark = Color(0xFF1557B0);
  static const Color accent = Color(0xFF34A853); // green for success
  static const Color warning = Color(0xFFFBBC04); // amber for in-progress
  static const Color error = Color(0xFFEA4335); // red for failed
  static const Color surface = Color(0xFFF8F9FA);
  static const Color textPrimary = Color(0xFF202124);
  static const Color textSecondary = Color(0xFF5F6368);

  // ── Status colors ─────────────────────────────────────────────────
  // Used for order status badges throughout the app
  static Color statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return Colors.grey;
      case 'ASSIGNED':
        return warning;
      case 'PICKED_UP':
        return Colors.orange;
      case 'IN_TRANSIT':
        return primary;
      case 'DELIVERED':
        return accent;
      case 'FAILED':
        return error;
      default:
        return Colors.grey;
    }
  }

  // ── Theme data ────────────────────────────────────────────────────
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.white,
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
