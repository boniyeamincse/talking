import 'package:flutter/material.dart';
import 'package:banitalk/core/theme/app_theme.dart';

class StepIdentity extends StatelessWidget {
  const StepIdentity({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Who are you?',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          const Text(
            'Set up your public identity for the community.',
            style: TextStyle(color: BaniTalkTheme.textSecondary),
          ),
          const SizedBox(height: 48),
          Center(
            child: Stack(
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: BaniTalkTheme.surface2,
                    shape: BoxShape.circle,
                    border: Border.all(color: BaniTalkTheme.primary, width: 2),
                  ),
                  child: const Icon(Icons.person_rounded, size: 60, color: BaniTalkTheme.textSecondary),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: BaniTalkTheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.camera_alt_rounded, size: 20, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 48),
          const TextField(
            maxLines: 3,
            decoration: InputDecoration(
              labelText: 'BIO',
              hintText: 'Tell us about yourself...',
              alignLabelWithHint: true,
            ),
          ),
        ],
      ),
    );
  }
}
