// active_delivery.screen.dart — Full-screen delivery view for riders
//
// Shows:
// - Google Maps with rider's current position and destination
// - Order details in a bottom sheet
// - Action buttons (Picked Up → Start Delivery → Confirm PIN)
// - Live GPS streaming to Firestore while IN_TRANSIT

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/constants.dart';
import '../../providers/auth.provider.dart';
import '../../services/api.service.dart';
import '../../services/location.service.dart';

class ActiveDeliveryScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> order;

  const ActiveDeliveryScreen({super.key, required this.order});

  @override
  ConsumerState<ActiveDeliveryScreen> createState() =>
      _ActiveDeliveryScreenState();
}

class _ActiveDeliveryScreenState extends ConsumerState<ActiveDeliveryScreen> {
  // ── Map ────────────────────────────────────────────────────────
  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  // ── Location ──────────────────────────────────────────────────
  final LocationService _locationService = LocationService();
  StreamSubscription<Position>? _locationSubscription;
  Position? _currentPosition;

  // ── State ──────────────────────────────────────────────────────
  bool _isUpdating = false;
  late String _currentStatus;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.order['status'];
    _initLocation();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  // ── Initialize location ────────────────────────────────────────
  Future<void> _initLocation() async {
    final hasPermission = await _locationService.requestPermission();
    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location permission required for delivery tracking'),
            backgroundColor: Color(0xFFEA4335),
          ),
        );
      }
      return;
    }

    // Get initial position to center the map
    final position = await _locationService.getCurrentPosition();
    if (position != null && mounted) {
      setState(() {
        _currentPosition = position;
        _updateRiderMarker(position);
      });

      _mapController?.animateCamera(
        CameraUpdate.newLatLng(
          LatLng(position.latitude, position.longitude),
        ),
      );
    }

    // Start streaming if already IN_TRANSIT
    if (_currentStatus == 'IN_TRANSIT') {
      _startGpsStreaming();
    }
  }

  // ── Start GPS streaming to Firestore ──────────────────────────
  // Called when rider taps "Start Delivery" (IN_TRANSIT)
  void _startGpsStreaming() {
    final orderId = widget.order['id'];

    final stream = _locationService.startTracking(orderId);
    _locationSubscription = stream.listen((position) {
      if (mounted) {
        setState(() {
          _currentPosition = position;
          _updateRiderMarker(position);
        });

        // Keep map centered on rider
        _mapController?.animateCamera(
          CameraUpdate.newLatLng(
            LatLng(position.latitude, position.longitude),
          ),
        );
      }
    });
  }

  // ── Stop GPS streaming ────────────────────────────────────────
  void _stopGpsStreaming() {
    _locationSubscription?.cancel();
    _locationSubscription = null;
    _locationService.stopTracking();
  }

  // ── Update rider marker on map ────────────────────────────────
  void _updateRiderMarker(Position position) {
    _markers.removeWhere((m) => m.markerId.value == 'rider');
    _markers.add(
      Marker(
        markerId: const MarkerId('rider'),
        position: LatLng(position.latitude, position.longitude),
        infoWindow: const InfoWindow(title: 'You'),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          BitmapDescriptor.hueBlue,
        ),
      ),
    );
  }

  // ── Status update ──────────────────────────────────────────────
  Future<void> _updateStatus(String status, {String? pin}) async {
    setState(() => _isUpdating = true);
    try {
      final api = ref.read(apiServiceProvider);
      await api.updateOrderStatus(
        orderId: widget.order['id'],
        status: status,
        pin: pin,
      );

      setState(() => _currentStatus = status);

      // Start GPS when going IN_TRANSIT
      if (status == 'IN_TRANSIT') {
        _startGpsStreaming();
      }

      // Stop GPS and go back when delivered
      if (status == 'DELIVERED' || status == 'FAILED') {
        _stopGpsStreaming();
        if (mounted) {
          Navigator.pop(context, true); // true = refresh parent
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update status: $e'),
            backgroundColor: const Color(0xFFEA4335),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  // ── PIN dialog ────────────────────────────────────────────────
  Future<void> _showPinDialog() async {
    final pinController = TextEditingController();

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Enter Delivery PIN'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Ask the customer for their 4-digit PIN',
              style: TextStyle(color: Color(0xFF5F6368)),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              autofocus: true,
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                letterSpacing: 16,
              ),
              decoration: const InputDecoration(
                counterText: '',
                border: OutlineInputBorder(),
                hintText: '••••',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (pinController.text.length == 4) {
                Navigator.pop(context);
                _updateStatus('DELIVERED', pin: pinController.text);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF34A853),
            ),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final initialPosition = _currentPosition != null
        ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
        : const LatLng(AppConstants.defaultLat, AppConstants.defaultLng);

    return Scaffold(
      body: Stack(
        children: [
          // ── Full screen map ──────────────────────────────────
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: initialPosition,
              zoom: 15,
            ),
            onMapCreated: (controller) {
              _mapController = controller;
            },
            markers: _markers,
            polylines: _polylines,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),

          // ── Back button ──────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: CircleAvatar(
                backgroundColor: Colors.white,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
          ),

          // ── Bottom sheet with order details ──────────────────
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    offset: Offset(0, -2),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Drag handle
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Status badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        order['customer_name'],
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      _StatusBadge(status: _currentStatus),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Phone
                  Row(
                    children: [
                      const Icon(Icons.phone_outlined,
                          size: 16, color: Color(0xFF5F6368)),
                      const SizedBox(width: 6),
                      Text(
                        order['customer_phone'],
                        style: const TextStyle(color: Color(0xFF5F6368)),
                      ),
                    ],
                  ),

                  const SizedBox(height: 4),

                  // Address
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 16, color: Color(0xFF5F6368)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          order['customer_address'],
                          style: const TextStyle(color: Color(0xFF5F6368)),
                        ),
                      ),
                    ],
                  ),

                  // Items
                  if (order['items_description'] != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.inventory_2_outlined,
                            size: 16, color: Color(0xFF5F6368)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            order['items_description'],
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ],

                  // Notes
                  if (order['notes'] != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.note_outlined,
                            size: 16, color: Color(0xFF5F6368)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            order['notes'],
                            style: const TextStyle(
                              color: Color(0xFF5F6368),
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],

                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 8),

                  // Action button
                  if (_isUpdating)
                    const Center(child: CircularProgressIndicator())
                  else
                    _buildActionButton(),

                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    switch (_currentStatus) {
      case 'ASSIGNED':
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () => _updateStatus('PICKED_UP'),
            icon: const Icon(Icons.check),
            label: const Text('Mark as Picked Up'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              minimumSize: const Size(double.infinity, 52),
            ),
          ),
        );
      case 'PICKED_UP':
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () => _updateStatus('IN_TRANSIT'),
            icon: const Icon(Icons.directions_bike),
            label: const Text('Start Delivery'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1A73E8),
              minimumSize: const Size(double.infinity, 52),
            ),
          ),
        );
      case 'IN_TRANSIT':
        return Column(
          children: [
            // GPS indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF34A853).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFF34A853).withOpacity(0.3),
                ),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.gps_fixed,
                      size: 14, color: Color(0xFF34A853)),
                  SizedBox(width: 4),
                  Text(
                    'Live location sharing active',
                    style: TextStyle(
                      color: Color(0xFF34A853),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _showPinDialog,
                icon: const Icon(Icons.lock_open),
                label: const Text('Confirm Delivery (Enter PIN)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF34A853),
                  minimumSize: const Size(double.infinity, 52),
                ),
              ),
            ),
          ],
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case 'ASSIGNED':
        color = const Color(0xFFFBBC04);
        break;
      case 'PICKED_UP':
        color = Colors.orange;
        break;
      case 'IN_TRANSIT':
        color = const Color(0xFF1A73E8);
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}