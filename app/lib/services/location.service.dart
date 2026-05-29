// location.service.dart — GPS location streaming
//
// This service handles getting the rider's GPS position and
// writing it to Firestore in real time so the customer can
// watch the rider move on the map.

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';
import '../core/constants.dart';

class LocationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Holds the active location stream so we can cancel it later
  Stream<Position>? _locationStream;

  // ── Permission check ──────────────────────────────────────────────
  // Must be called before starting location tracking
  // Returns true if permission granted, false otherwise

  Future<bool> requestPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false; // GPS is turned off on the device
    }

    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false; // User permanently denied — send them to settings
    }

    return true;
  }

  // ── Start streaming location to Firestore ─────────────────────────
  // Called when a rider accepts a delivery
  // orderId is used as the Firestore document path

  Stream<Position> startTracking(String orderId) {
    // distanceFilter: only emit a new position after moving 10 metres
    // This saves battery and data — we don't need updates while standing still
    final locationSettings = const LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: AppConstants.locationDistanceFilter,
    );

    _locationStream = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    );

    // Write each position update to Firestore
    _locationStream!.listen((Position position) {
      _writeToFirestore(orderId, position);
    });

    return _locationStream!;
  }

  // ── Write position to Firestore ───────────────────────────────────
  // The customer tracking page listens to this document in real time

  Future<void> _writeToFirestore(String orderId, Position position) async {
    try {
      await _firestore
          .collection(AppConstants.firestoreDeliveriesCollection)
          .doc(orderId)
          .collection('location')
          .doc('current') // always overwrite the same document
          .set({
        'lat': position.latitude,
        'lng': position.longitude,
        'heading': position.heading,
        'speed': position.speed,
        'updated_at': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Firestore write error: $e');
      // TODO Phase 3.5: queue to SQLite when offline
    }
  }

  // ── Get current position once ─────────────────────────────────────
  // Used to center the map when the screen opens

  Future<Position?> getCurrentPosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      return null;
    }
  }

  // ── Stop tracking ─────────────────────────────────────────────────
  // Called when delivery is confirmed

  void stopTracking() {
    _locationStream = null;
  }
}