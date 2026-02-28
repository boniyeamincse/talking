import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class ChatInput extends StatefulWidget {
  final Function(String, String) onSend; // content, type

  const ChatInput({super.key, required this.onSend});

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> {
  final TextEditingController _controller = TextEditingController();
  bool _isRecording = false;

  void _handleSend() {
    if (_controller.text.trim().isNotEmpty) {
      widget.onSend(_controller.text.trim(), 'text');
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: BaniTalkTheme.bg,
        border: Border(top: BorderSide(color: BaniTalkTheme.textSecondary.withOpacity(0.1))),
      ),
      child: SafeArea(
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.emoji_emotions_outlined, color: BaniTalkTheme.textSecondary),
              onPressed: () {}, // TODO: Emoji picker
            ),
            IconButton(
              icon: const Icon(Icons.add_rounded, color: BaniTalkTheme.textSecondary),
              onPressed: () {}, // TODO: Media attachment
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: BaniTalkTheme.surface,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _controller,
                  decoration: const InputDecoration(
                    hintText: 'Message...',
                    border: InputBorder.none,
                    hintStyle: TextStyle(color: BaniTalkTheme.textSecondary),
                  ),
                  onSubmitted: (_) => _handleSend(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            _isRecording
                ? IconButton(
                    icon: const Icon(Icons.stop_circle_rounded, color: Colors.red),
                    onPressed: () => setState(() => _isRecording = false),
                  )
                : IconButton(
                    icon: _controller.text.isEmpty
                        ? const Icon(Icons.mic_none_rounded, color: BaniTalkTheme.textSecondary)
                        : const Icon(Icons.send_rounded, color: BaniTalkTheme.primary),
                    onPressed: _controller.text.isEmpty
                        ? () => setState(() => _isRecording = true)
                        : _handleSend,
                  ),
          ],
        ),
      ),
    );
  }
}
