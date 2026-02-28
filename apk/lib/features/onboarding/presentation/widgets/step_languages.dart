import 'package:flutter/material.dart';
import 'package:banitalk/core/theme/app_theme.dart';

class StepLanguages extends StatefulWidget {
  const StepLanguages({super.key});

  @override
  State<StepLanguages> createState() => _StepLanguagesState();
}

class _StepLanguagesState extends State<StepLanguages> {
  final List<String> _languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 
    'Japanese', 'Korean', 'Arabic', 'Russian', 'Portuguese',
    'Bengali', 'Hindi', 'Italian', 'Turkish', 'Vietnamese'
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
            'What languages do you speak?',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          const Text(
            'Select the languages you want to practice or learn.',
            style: TextStyle(color: BaniTalkTheme.textSecondary),
          ),
          const SizedBox(height: 32),
          const TextField(
            decoration: InputDecoration(
              hintText: 'Search languages...',
              prefixIcon: Icon(Icons.search_rounded, color: BaniTalkTheme.textSecondary),
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: ListView.builder(
              itemCount: _languages.length,
              itemBuilder: (context, index) {
                final lang = _languages[index];
                final isSelected = _selected.contains(lang);
                return ListTile(
                  onTap: () => setState(() {
                    isSelected ? _selected.remove(lang) : _selected.add(lang);
                  }),
                  title: Text(lang, style: const TextStyle(fontWeight: FontWeight.w600)),
                  trailing: Icon(
                    isSelected ? Icons.check_circle_rounded : Icons.add_circle_outline_rounded,
                    color: isSelected ? BaniTalkTheme.primary : BaniTalkTheme.textSecondary,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
