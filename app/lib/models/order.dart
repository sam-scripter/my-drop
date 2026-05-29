// order.dart — Order and Delivery data models

class OrderModel {
  final String id;
  final String businessId;
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final String? itemsDescription;
  final String status;
  final String trackingToken;
  final String trackingUrl;
  final String? notes;
  final DateTime createdAt;
  final DeliveryModel? delivery;

  OrderModel({
    required this.id,
    required this.businessId,
    required this.customerName,
    required this.customerPhone,
    required this.customerAddress,
    this.itemsDescription,
    required this.status,
    required this.trackingToken,
    required this.trackingUrl,
    this.notes,
    required this.createdAt,
    this.delivery,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'],
      businessId: json['business_id'],
      customerName: json['customer_name'],
      customerPhone: json['customer_phone'],
      customerAddress: json['customer_address'],
      itemsDescription: json['items_description'],
      status: json['status'],
      trackingToken: json['tracking_token'],
      trackingUrl: json['tracking_url'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
      delivery: json['delivery'] != null
          ? DeliveryModel.fromJson(json['delivery'])
          : null,
    );
  }
}

class DeliveryModel {
  final String id;
  final String orderId;
  final String riderId;
  final String deliveryPin;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;
  final RiderInfo? rider;

  DeliveryModel({
    required this.id,
    required this.orderId,
    required this.riderId,
    required this.deliveryPin,
    this.pickedUpAt,
    this.deliveredAt,
    this.rider,
  });

  factory DeliveryModel.fromJson(Map<String, dynamic> json) {
    return DeliveryModel(
      id: json['id'],
      orderId: json['order_id'],
      riderId: json['rider_id'],
      deliveryPin: json['delivery_pin'],
      pickedUpAt: json['picked_up_at'] != null
          ? DateTime.parse(json['picked_up_at'])
          : null,
      deliveredAt: json['delivered_at'] != null
          ? DateTime.parse(json['delivered_at'])
          : null,
      rider: json['rider'] != null
          ? RiderInfo.fromJson(json['rider'])
          : null,
    );
  }
}

class RiderInfo {
  final String id;
  final String name;
  final String phone;

  RiderInfo({
    required this.id,
    required this.name,
    required this.phone,
  });

  factory RiderInfo.fromJson(Map<String, dynamic> json) {
    return RiderInfo(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
    );
  }
}