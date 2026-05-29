// orders.screen.dart — Full orders list with status filtering

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api.service.dart';
import '../../providers/auth.provider.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  List<dynamic> _orders = [];
  bool _isLoading = true;
  String? _selectedStatus;

  final List<String?> _statusFilters = [
    null, 'PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'
  ];
  final List<String> _statusLabels = [
    'All', 'Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed'
  ];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final data = await api.getOrders(status: _selectedStatus);
      setState(() {
        _orders = data['orders'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Orders'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.pushNamed(context, '/manager/create-order');
          _loadOrders(); // refresh after creating
        },
        icon: const Icon(Icons.add),
        label: const Text('New Order'),
      ),
      body: Column(
        children: [
          // Status filter chips
          SizedBox(
            height: 56,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _statusFilters.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedStatus == _statusFilters[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(_statusLabels[index]),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(() => _selectedStatus = _statusFilters[index]);
                      _loadOrders();
                    },
                  ),
                );
              },
            ),
          ),

          // Orders list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _orders.isEmpty
                ? const Center(
              child: Text(
                'No orders found',
                style: TextStyle(color: Color(0xFF5F6368)),
              ),
            )
                : RefreshIndicator(
              onRefresh: _loadOrders,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _orders.length,
                itemBuilder: (context, index) {
                  final order = _orders[index];
                  return _OrderCard(
                    order: order,
                    onAssign: _loadOrders,
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderCard extends ConsumerStatefulWidget {
  final Map<String, dynamic> order;
  final VoidCallback onAssign;

  const _OrderCard({required this.order, required this.onAssign});

  @override
  ConsumerState<_OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends ConsumerState<_OrderCard> {
  Future<void> _showAssignDialog() async {
    final api = ref.read(apiServiceProvider);
    List<dynamic> riders = [];

    try {
      final data = await api.getRiders();
      riders = (data['riders'] as List)
          .where((r) => r['is_active'] == true)
          .toList();
    } catch (e) {
      return;
    }

    if (!mounted) return;

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Assign Rider'),
        content: SizedBox(
          width: double.maxFinite,
          child: riders.isEmpty
              ? const Text('No active riders available')
              : ListView.builder(
            shrinkWrap: true,
            itemCount: riders.length,
            itemBuilder: (context, index) {
              final rider = riders[index];
              return ListTile(
                leading: const CircleAvatar(
                  child: Icon(Icons.person),
                ),
                title: Text(rider['name']),
                subtitle: Text(rider['phone']),
                onTap: () async {
                  Navigator.pop(context);
                  try {
                    await api.assignRider(
                      orderId: widget.order['id'],
                      riderId: rider['id'],
                    );
                    widget.onAssign();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Rider assigned successfully'),
                          backgroundColor: Color(0xFF34A853),
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Failed to assign rider'),
                          backgroundColor: Color(0xFFEA4335),
                        ),
                      );
                    }
                  }
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final status = order['status'] as String;
    final statusColor = _statusColor(status);

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
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    status,
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
            Text(
              order['customer_phone'],
              style: const TextStyle(color: Color(0xFF5F6368)),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined,
                    size: 14, color: Color(0xFF5F6368)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    order['customer_address'],
                    style: const TextStyle(
                        color: Color(0xFF5F6368), fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            if (order['items_description'] != null) ...[
              const SizedBox(height: 4),
              Text(
                order['items_description'],
                style: const TextStyle(fontSize: 13),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            // Tracking link
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.link, size: 14, color: Color(0xFF1A73E8)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    order['tracking_url'],
                    style: const TextStyle(
                      color: Color(0xFF1A73E8),
                      fontSize: 12,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            // Assign rider button — only show for PENDING orders
            if (status == 'PENDING') ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _showAssignDialog,
                  icon: const Icon(Icons.person_add_outlined),
                  label: const Text('Assign Rider'),
                ),
              ),
            ],

            // Show assigned rider info
            if (order['delivery'] != null &&
                order['delivery']['rider'] != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.directions_bike,
                      size: 14, color: Color(0xFF5F6368)),
                  const SizedBox(width: 4),
                  Text(
                    'Rider: ${order['delivery']['rider']['name']}',
                    style: const TextStyle(
                        color: Color(0xFF5F6368), fontSize: 13),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING': return Colors.grey;
      case 'ASSIGNED': return const Color(0xFFFBBC04);
      case 'PICKED_UP': return Colors.orange;
      case 'IN_TRANSIT': return const Color(0xFF1A73E8);
      case 'DELIVERED': return const Color(0xFF34A853);
      case 'FAILED': return const Color(0xFFEA4335);
      default: return Colors.grey;
    }
  }
}