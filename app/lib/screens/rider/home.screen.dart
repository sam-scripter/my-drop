// home.screen.dart — Rider's home screen
// Shows current status, active delivery, and recent deliveries

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth.provider.dart';
import '../../services/api.service.dart';


class RiderHomeScreen extends ConsumerStatefulWidget {
  const RiderHomeScreen({super.key});

  @override
  ConsumerState<RiderHomeScreen> createState() => _RiderHomeScreenState();
}

class _RiderHomeScreenState extends ConsumerState<RiderHomeScreen> {
  List<dynamic> _activeDeliveries = [];
  List<dynamic> _recentDeliveries = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDeliveries();
  }

  Future<void> _loadDeliveries() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);

      final results = await Future.wait([
        api.getOrders(status: 'ASSIGNED'),
        api.getOrders(status: 'PICKED_UP'),   // ← add this
        api.getOrders(status: 'IN_TRANSIT'),
        api.getOrders(status: 'DELIVERED'),
      ]);

      setState(() {
        _activeDeliveries = [
          ...results[0]['orders'],
          ...results[1]['orders'],   // ← add this
          ...results[2]['orders'],
        ];
        _recentDeliveries =
            (results[3]['orders'] as List).take(5).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('mydrop'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
        onRefresh: _loadDeliveries,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Rider greeting
              Text(
                'Hi ${user?.name.split(' ').first} 👋',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _activeDeliveries.isEmpty
                    ? 'No active deliveries'
                    : '${_activeDeliveries.length} active ${_activeDeliveries.length == 1 ? 'delivery' : 'deliveries'}',
                style: const TextStyle(color: Color(0xFF5F6368)),
              ),

              const SizedBox(height: 24),

              // Active deliveries
              if (_activeDeliveries.isNotEmpty) ...[
                const Text(
                  'Active deliveries',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                ..._activeDeliveries.map(
                      (order) => _ActiveDeliveryCard(
                    order: order,
                    onStatusUpdate: _loadDeliveries,
                  ),
                ),
              ] else ...[
                // Empty state
                Center(
                  child: Column(
                    children: [
                      const SizedBox(height: 48),
                      Icon(
                        Icons.check_circle_outline,
                        size: 80,
                        color: Colors.grey.shade300,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'No active deliveries',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Text(
                        'New orders will appear here',
                        style: TextStyle(color: Color(0xFF5F6368)),
                      ),
                    ],
                  ),
                ),
              ],

              // Recent deliveries
              if (_recentDeliveries.isNotEmpty) ...[
                const SizedBox(height: 24),
                const Text(
                  'Recent deliveries',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                ..._recentDeliveries.map(
                      (order) => Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Color(0xFFE8F5E9),
                        child: Icon(
                          Icons.check,
                          color: Color(0xFF34A853),
                        ),
                      ),
                      title: Text(order['customer_name']),
                      subtitle: Text(order['customer_address'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                      trailing: const Text(
                        'DELIVERED',
                        style: TextStyle(
                          color: Color(0xFF34A853),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ActiveDeliveryCard extends ConsumerStatefulWidget {
  final Map<String, dynamic> order;
  final VoidCallback onStatusUpdate;

  const _ActiveDeliveryCard({
    required this.order,
    required this.onStatusUpdate,
  });

  @override
  ConsumerState<_ActiveDeliveryCard> createState() =>
      _ActiveDeliveryCardState();
}

class _ActiveDeliveryCardState extends ConsumerState<_ActiveDeliveryCard> {
  bool _isUpdating = false;

  Future<void> _updateStatus(String status, {String? pin}) async {
    setState(() => _isUpdating = true);
    try {
      final api = ref.read(apiServiceProvider);
      await api.updateOrderStatus(
        orderId: widget.order['id'],
        status: status,
        pin: pin,
      );
      widget.onStatusUpdate();
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

  Future<void> _showPinDialog() async {
    final pinController = TextEditingController();

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter Delivery PIN'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Ask the customer for their 4-digit PIN'),
            const SizedBox(height: 16),
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: 16,
              ),
              decoration: const InputDecoration(
                counterText: '',
                border: OutlineInputBorder(),
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
              Navigator.pop(context);
              _updateStatus('DELIVERED', pin: pinController.text);
            },
            child: const Text('Confirm Delivery'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final status = order['status'] as String;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  order['customer_name'],
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Container(
                  padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBBC04).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    status,
                    style: const TextStyle(
                      color: Color(0xFFFBBC04),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(order['customer_phone'],
                style: const TextStyle(color: Color(0xFF5F6368))),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined,
                    size: 14, color: Color(0xFF5F6368)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    order['customer_address'],
                    style: const TextStyle(color: Color(0xFF5F6368)),
                    maxLines: 2,
                  ),
                ),
              ],
            ),
            if (order['items_description'] != null) ...[
              const SizedBox(height: 4),
              Text(order['items_description'],
                  style: const TextStyle(fontSize: 13)),
            ],
            if (order['notes'] != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.note_outlined,
                      size: 14, color: Color(0xFF5F6368)),
                  const SizedBox(width: 4),
                  Text(
                    order['notes'],
                    style: const TextStyle(
                        fontSize: 13, color: Color(0xFF5F6368)),
                  ),
                ],
              ),
            ],

            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),

            // Action buttons based on current status
            if (_isUpdating)
              const Center(child: CircularProgressIndicator())
            else if (status == 'ASSIGNED')
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _updateStatus('PICKED_UP'),
                  icon: const Icon(Icons.check),
                  label: const Text('Mark as Picked Up'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                  ),
                ),
              )
            else if (status == 'PICKED_UP')
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _updateStatus('IN_TRANSIT'),
                    icon: const Icon(Icons.directions_bike),
                    label: const Text('Start Delivery'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1A73E8),
                    ),
                  ),
                )
              else if (status == 'IN_TRANSIT')
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _showPinDialog,
                      icon: const Icon(Icons.lock_open),
                      label: const Text('Confirm Delivery (Enter PIN)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF34A853),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}