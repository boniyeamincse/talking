import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class StatItem extends StatelessWidget {
  final String label;
  final int count;

  const StatItem({super.key, required this.label, required this.count});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          count.toString(),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: Colors.white,
          ),
        ),
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: BaniTalkTheme.textSecondary,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }
}
