import 'package:flutter/material.dart';
import 'package:banitalk/core/theme/app_theme.dart';

class StepInterests extends StatefulWidget {
  const StepInterests({super.key});

  @override
  State<StepInterests> createState() => _StepInterestsState();
}

class _StepInterestsState extends State<StepInterests> {
  final List<String> _interests = [
    'Travel', 'Music', 'Cooking', 'Art', 'History',
    'Tech', 'Movies', 'Sports', 'Literature', 'Gaming',
    'Fashion', 'Science', 'Nature', 'Socializing', 'Photography'
  ];
  final Set<String> _selected = {};

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Tell us what you love',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          const Text(
            'We will use this to find you the best cultural partners.',
            style: TextStyle(color: BaniTalkTheme.textSecondary),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _interests.map((interest) {
              final isSelected = _selected.contains(interest);
              return GestureDetector(
                onTap: () => setState(() {
                  isSelected ? _selected.remove(interest) : _selected.add(interest);
                }),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? BaniTalkTheme.primary : BaniTalkTheme.surface2,
                    borderRadius: BorderRadius.circular(24),
                    border: isSelected ? null : Border.all(color: BaniTalkTheme.textSecondary.withOpacity(0.2)),
                  ),
                  child: Text(
                    interest,
                    style: TextStyle(
                      color: isSelected ? Colors.white : BaniTalkTheme.textSecondary,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
