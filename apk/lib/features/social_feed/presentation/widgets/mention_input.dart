import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class MentionInput extends StatefulWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final String hintText;
  final Function(String username) onMentionAdded;

  const MentionInput({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.hintText,
    required this.onMentionAdded,
  });

  @override
  State<MentionInput> createState() => _MentionInputState();
}

class _MentionInputState extends State<MentionInput> {
  final List<String> _availableUsers = [
    'john_doe',
    'jane_smith',
    'mike_wilson',
    'sarah_jones',
    'alex_brown',
    'emma_davis',
    'chris_miller',
    'lisa_garcia',
  ];
  
  List<String> _filteredUsers = [];
  bool _showMentions = false;
  int _selectedMentionIndex = 0;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onTextChanged);
    super.dispose();
  }

  void _onTextChanged() {
    final text = widget.controller.text;
    final cursorPosition = widget.controller.selection.baseOffset;
    
    if (cursorPosition > 0) {
      final beforeCursor = text.substring(0, cursorPosition);
      final mentionMatch = RegExp(r'@(\w*)$').firstMatch(beforeCursor);
      
      if (mentionMatch != null) {
        final query = mentionMatch.group(1)!;
        _filterUsers(query);
        _showMentions = true;
        _selectedMentionIndex = 0;
      } else {
        _showMentions = false;
        _filteredUsers.clear();
      }
    } else {
      _showMentions = false;
      _filteredUsers.clear();
    }
    
    setState(() {});
  }

  void _filterUsers(String query) {
    if (query.isEmpty) {
      _filteredUsers = List.from(_availableUsers);
    } else {
      _filteredUsers = _availableUsers
          .where((user) => user.toLowerCase().contains(query.toLowerCase()))
          .toList();
    }
  }

  void _selectMention(String username) {
    final text = widget.controller.text;
    final cursorPosition = widget.controller.selection.baseOffset;
    final beforeCursor = text.substring(0, cursorPosition);
    final afterCursor = text.substring(cursorPosition);
    
    final mentionMatch = RegExp(r'@(\w*)$').firstMatch(beforeCursor);
    if (mentionMatch != null) {
      final newBeforeCursor = beforeCursor.replaceRange(
        mentionMatch.start,
        mentionMatch.end,
        '@$username',
      );
      
      widget.controller.text = newBeforeCursor + afterCursor;
      widget.controller.selection = TextSelection.fromPosition(
        TextPosition(offset: newBeforeCursor.length),
      );
      
      widget.onMentionAdded(username);
    }
    
    setState(() {
      _showMentions = false;
      _filteredUsers.clear();
    });
  }

  void _handleKey(KeyEvent event) {
    if (!_showMentions || _filteredUsers.isEmpty) return;
    
    if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
      setState(() {
        _selectedMentionIndex = (_selectedMentionIndex + 1) % _filteredUsers.length;
      });
    } else if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
      setState(() {
        _selectedMentionIndex = (_selectedMentionIndex - 1 + _filteredUsers.length) % _filteredUsers.length;
      });
    } else if (event.logicalKey == LogicalKeyboardKey.enter || 
               event.logicalKey == LogicalKeyboardKey.tab) {
      _selectMention(_filteredUsers[_selectedMentionIndex]);
    } else if (event.logicalKey == LogicalKeyboardKey.escape) {
      setState(() {
        _showMentions = false;
        _filteredUsers.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: widget.controller,
          focusNode: widget.focusNode,
          maxLines: null,
          style: TextStyle(
            color: BaniTalkTheme.textBody,
            fontSize: 14,
          ),
          decoration: InputDecoration(
            hintText: widget.hintText,
            hintStyle: TextStyle(
              color: BaniTalkTheme.textSecondary,
              fontSize: 14,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(
                color: BaniTalkTheme.surface2,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(
                color: BaniTalkTheme.surface2,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(
                color: BaniTalkTheme.primary,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
          onKey: (event) => _handleKey(event),
        ),
        if (_showMentions && _filteredUsers.isNotEmpty) ...[
          const SizedBox(height: 4),
          Container(
            decoration: BoxDecoration(
              color: BaniTalkTheme.surface,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: _filteredUsers.length,
              itemBuilder: (context, index) {
                final username = _filteredUsers[index];
                final isSelected = index == _selectedMentionIndex;
                
                return GestureDetector(
                  onTap: () => _selectMention(username),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected 
                          ? BaniTalkTheme.primary.withOpacity(0.1)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: BaniTalkTheme.surface2,
                          child: Icon(
                            Icons.person,
                            color: BaniTalkTheme.textSecondary,
                            size: 16,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '@$username',
                                style: TextStyle(
                                  color: isSelected 
                                      ? BaniTalkTheme.primary
                                      : BaniTalkTheme.textBody,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                'User name',
                                style: TextStyle(
                                  color: BaniTalkTheme.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ],
    );
  }
}
