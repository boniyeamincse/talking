import 'package:flutter/material.dart';
import '../../data/models/user_profile_model.dart';
import '../../../../core/theme/app_theme.dart';
import 'badge_widget.dart';

class UserCard extends StatelessWidget {
  final UserProfile user;
  final VoidCallback onTap;

  const UserCard({super.key, required this.user, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: BaniTalkTheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: BaniTalkTheme.textSecondary.withOpacity(0.05)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: BaniTalkTheme.surface2,
                  backgroundImage: user.avatarUrl != null ? NetworkImage(user.avatarUrl!) : null,
                  child: user.avatarUrl == null
                      ? const Icon(Icons.person, color: BaniTalkTheme.textSecondary)
                      : null,
                ),
                if (user.isOnline)
                  Positioned(
                    right: 2,
                    bottom: 2,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                        border: Border.all(color: BaniTalkTheme.surface, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        user.name,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      const SizedBox(width: 8),
                      // Display first badge if available
                      if (user.badges.isNotEmpty) BadgeWidget(badge: user.badges.first),
                    ],
                  ),
                  Text(
                    '@${user.username}',
                    style: const TextStyle(color: BaniTalkTheme.textSecondary, fontSize: 13),
                  ),
                  if (user.bio != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        user.bio!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: BaniTalkTheme.textSecondary.withOpacity(0.8), fontSize: 12),
                      ),
                    ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: BaniTalkTheme.textSecondary.withOpacity(0.5)),
          ],
        ),
      ),
    );
  }
}
