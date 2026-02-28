import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:banitalk/core/theme/app_theme.dart';
import 'package:banitalk/shared/widgets/primary_button.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_event.dart';
import '../bloc/profile_state.dart';
import '../widgets/stat_item.dart';
import '../widgets/badge_widget.dart';

class ProfileScreen extends StatefulWidget {
  final int userId;
  const ProfileScreen({super.key, required this.userId});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isBlocked = false;

  @override
  void initState() {
    super.initState();
    context.read<ProfileBloc>().add(LoadProfile(widget.userId));
  }

  void _handleBlock() {
    setState(() => _isBlocked = true);
    context.read<ProfileBloc>().add(BlockUserEvent(widget.userId));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('User blocked'), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isBlocked) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(
          child: Text('This profile is no longer available.',
              style: TextStyle(color: BaniTalkTheme.textSecondary)),
        ),
      );
    }

    return Scaffold(
      body: BlocConsumer<ProfileBloc, ProfileState>(
        listener: (context, state) {
          if (state is ProfileError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: Colors.red),
            );
          }
        },
        builder: (context, state) {
          if (state is ProfileLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is ProfileLoaded) {
            final user = state.profile;
            return CustomScrollView(
              slivers: [
                SliverAppBar(
                  expandedHeight: 300,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Stack(
                      fit: Stack Fit.expand,
                      children: [
                        if (user.avatarUrl != null)
                          Image.network(user.avatarUrl!, fit: BoxFit.cover)
                        else
                          Container(color: BaniTalkTheme.surface2),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                BaniTalkTheme.bg.withOpacity(0.8),
                                BaniTalkTheme.bg,
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.block_rounded, color: Colors.redAccent),
                      onPressed: _handleBlock,
                    ),
                  ],
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user.name,
                                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
                                ),
                                Text(
                                  '@${user.username}',
                                  style: const TextStyle(color: BaniTalkTheme.textSecondary, fontSize: 16),
                                ),
                              ],
                            ),
                            if (user.isOnline)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.green.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.green.withOpacity(0.5)),
                                ),
                                child: const Row(
                                  children: [
                                    CircleAvatar(radius: 4, backgroundColor: Colors.green),
                                    SizedBox(width: 6),
                                    Text('ONLINE',
                                        style: TextStyle(
                                            color: Colors.green,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: user.badges.map((b) => BadgeWidget(badge: b)).toList(),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            StatItem(label: 'Followers', count: user.followersCount),
                            StatItem(label: 'Following', count: user.followingCount),
                            StatItem(label: 'Gifts', count: user.giftsCount),
                          ],
                        ),
                        const SizedBox(height: 32),
                        const Text(
                          'BIO',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: BaniTalkTheme.textSecondary,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          user.bio ?? 'No bio yet.',
                          style: const TextStyle(fontSize: 15, height: 1.5),
                        ),
                        const SizedBox(height: 48),
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          transitionBuilder: (Widget child, Animation<double> animation) {
                            return ScaleTransition(scale: animation, child: child);
                          },
                          child: PrimaryButton(
                            key: ValueKey(user.isFollowing),
                            text: user.isFollowing ? 'Unfollow' : 'Follow',
                            onTap: () {
                              if (user.isFollowing) {
                                context.read<ProfileBloc>().add(UnfollowUserEvent(user.id));
                              } else {
                                context.read<ProfileBloc>().add(FollowUserEvent(user.id));
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }

          return const SizedBox();
        },
      ),
    );
  }
}
