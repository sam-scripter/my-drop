// user.dart — User data model
// Represents a manager or rider returned from the API

class UserModel {
  final String id;
  final String name;
  final String email;
  final String role; // 'MANAGER' or 'RIDER'
  final String? fcmToken;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.fcmToken,
  });

  // Creates a UserModel from the JSON the API returns
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      role: json['role'],
      fcmToken: json['fcm_token'],
    );
  }

  // Converts to JSON for local storage
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'fcm_token': fcmToken,
    };
  }

  bool get isManager => role == 'MANAGER';
  bool get isRider => role == 'RIDER';
}

class BusinessModel {
  final String id;
  final String name;
  final String? logoUrl;

  BusinessModel({
    required this.id,
    required this.name,
    this.logoUrl,
  });

  factory BusinessModel.fromJson(Map<String, dynamic> json) {
    return BusinessModel(
      id: json['id'],
      name: json['name'],
      logoUrl: json['logo_url'],
    );
  }
}