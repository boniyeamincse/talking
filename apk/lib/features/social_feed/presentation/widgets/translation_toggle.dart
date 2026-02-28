import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class TranslationToggle extends StatefulWidget {
  final bool isEnabled;
  final VoidCallback onTap;

  const TranslationToggle({
    super.key,
    required this.isEnabled,
    required this.onTap,
  });

  @override
  State<TranslationToggle> createState() => _TranslationToggleState();
}

class _TranslationToggleState extends State<TranslationToggle>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _animationController.forward(),
      onTapUp: (_) {
        _animationController.reverse();
        widget.onTap();
      },
      onTapCancel: () => _animationController.reverse(),
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: widget.isEnabled
                    ? BaniTalkTheme.primary.withOpacity(0.1)
                    : BaniTalkTheme.surface2,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: widget.isEnabled
                      ? BaniTalkTheme.primary.withOpacity(0.3)
                      : Colors.transparent,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.translate,
                    size: 14,
                    color: widget.isEnabled
                        ? BaniTalkTheme.primary
                        : BaniTalkTheme.textSecondary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    widget.isEnabled ? 'Translated' : 'Translate',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: widget.isEnabled
                          ? BaniTalkTheme.primary
                          : BaniTalkTheme.textSecondary,
                    ),
                  ),
                  if (widget.isEnabled) ...[
                    const SizedBox(width: 4),
                    Icon(
                      Icons.check_circle,
                      size: 12,
                      color: BaniTalkTheme.primary,
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
