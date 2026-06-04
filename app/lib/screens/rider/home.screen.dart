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
        api.getOrders(status: 'PICKED_UP'), // ← add this
        api.getOrders(status: 'IN_TRANSIT'),
        api.getOrders(status: 'DELIVERED'),
      ]);

      setState(() {
        _activeDeliveries = [
          ...results[0]['orders'],
          ...results[1]['orders'], // ← add this
          ...results[2]['orders'],
        ];
        _recentDeliveries = (results[3]['orders'] as List).take(5).toList();
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
                          onRefresh: _loadDeliveries,
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
                                maxLines: 1, overflow: TextOverflow.ellipsis),
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

class _ActiveDeliveryCard extends ConsumerWidget {
  final Map<String, dynamic> order;
  final VoidCallback onRefresh;

  const _ActiveDeliveryCard({
    required this.order,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = order['status'] as String;
    final statusColor = _statusColor(status);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () async {
          // Navigate to full delivery screen
          final result = await Navigator.pushNamed(
            context,
            '/rider/active-delivery',
            arguments: order,
          );
          // Refresh if delivery was completed
          if (result == true) onRefresh();
        },
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
                      color: statusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      status.replaceAll('_', ' '),
                      style: TextStyle(
                        color: statusColor,
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
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Tap hint
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Tap to open delivery',
                    style: TextStyle(
                      color: const Color(0xFFF97316).withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.arrow_forward_ios,
                    size: 10,
                    color: Color(0xFFF97316),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'ASSIGNED':
        return const Color(0xFFFBBC04);
      case 'PICKED_UP':
        return Colors.orange;
      case 'IN_TRANSIT':
        return const Color(0xFFF97316);
      default:
        return Colors.grey;
    }
  }
}
