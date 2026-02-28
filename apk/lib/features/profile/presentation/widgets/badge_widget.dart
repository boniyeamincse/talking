import 'package:flutter/material.dart';
import '../../data/models/user_profile_model.dart';
import '../../../../core/theme/app_theme.dart';

class BadgeWidget extends StatelessWidget {
  final UserBadge badge;
  const BadgeWidget({super.key, required this.badge});

  @override
  Widget build(BuildContext context) {
    String text = '';
    Color color = Colors.grey;
    IconData icon = Icons.star;

    switch (badge) {
      case UserBadge.vip:
        text = 'VIP';
        color = Colors.amber;
        icon = Icons.verified_rounded;
        break;
      case UserBadge.nativeSpeaker:
        text = 'Native';
        color = BaniTalkTheme.primary;
        icon = Icons.language_rounded;
        break;
      case UserBadge.aiCoach:
        text = 'AI Coach';
        color = BaniTalkTheme.accent;
        icon = Icons.psychology_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.5), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
