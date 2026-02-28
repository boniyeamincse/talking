import 'package:flutter/material.dart';
import 'package:banitalk/core/theme/app_theme.dart';
import 'package:banitalk/shared/widgets/primary_button.dart';
import 'package:banitalk/features/onboarding/presentation/widgets/step_identity.dart';
import 'package:banitalk/features/onboarding/presentation/widgets/step_languages.dart';
import 'package:banitalk/features/onboarding/presentation/widgets/step_interests.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  void _nextPage() {
    if (_currentStep < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Step ${_currentStep + 1} of 3'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: PageView(
              controller: _pageController,
              onPageChanged: (i) => setState(() => _currentStep = i),
              physics: const NeverScrollableScrollPhysics(),
              children: const [
                StepIdentity(),
                StepLanguages(),
                StepInterests(),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: PrimaryButton(
              text: _currentStep == 2 ? 'Let\'s Go!' : 'Continue',
              onTap: _nextPage,
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
