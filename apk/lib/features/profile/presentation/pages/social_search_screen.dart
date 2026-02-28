import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:banitalk/core/theme/app_theme.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_event.dart';
import '../bloc/profile_state.dart';
import '../widgets/user_card.dart';

class SocialSearchScreen extends StatefulWidget {
  const SocialSearchScreen({super.key});

  @override
  State<SocialSearchScreen> createState() => _SocialSearchScreenState();
}

class _SocialSearchScreenState extends State<SocialSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _searchFocus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }
    'Language Tutors',
    'Tech Geeks',
    'Travelers',
    'AI Enthusiasts',
    'Gamers'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Discover Communities'),
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: BaniTalkTheme.primary.withOpacity(_searchFocus.hasFocus ? 0.2 : 0),
                    blurRadius: 15,
                    spreadRadius: -2,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                focusNode: _searchFocus,
                onChanged: (val) {
                  context.read<ProfileBloc>().add(SearchUsers(val));
                },
                decoration: InputDecoration(
                  hintText: 'Search by name, interests...',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.tune_rounded),
                    onPressed: () {},
                  ),
                  filled: true,
                  fillColor: BaniTalkTheme.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: const BorderSide(color: BaniTalkTheme.primary, width: 1.5),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _popularSearches.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(_popularSearches[index]),
                    onSelected: (val) {
                      _searchController.text = _popularSearches[index];
                      context.read<ProfileBloc>().add(SearchUsers(_popularSearches[index]));
                    },
                    backgroundColor: BaniTalkTheme.surface,
                    selectedColor: BaniTalkTheme.primary.withOpacity(0.2),
                    labelStyle: TextStyle(
                      color: BaniTalkTheme.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(color: BaniTalkTheme.textSecondary.withOpacity(0.1)),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: BlocBuilder<ProfileBloc, ProfileState>(
              builder: (context, state) {
                if (state is SearchLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state is SearchLoaded) {
                  if (state.results.isEmpty) {
                    return const Center(
                      child: Text('No users found.',
                          style: TextStyle(color: BaniTalkTheme.textSecondary)),
                    );
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: state.results.length,
                    itemBuilder: (context, index) {
                      final user = state.results[index];
                      return UserCard(
                        user: user,
                        onTap: () => context.push('/profile/${user.id}'),
                      );
                    },
                  );
                }

                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.person_search_rounded, size: 64, color: BaniTalkTheme.surface2),
                      SizedBox(height: 16),
                      Text('Find your next cultural partner',
                          style: TextStyle(color: BaniTalkTheme.textSecondary)),
                    ],
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
