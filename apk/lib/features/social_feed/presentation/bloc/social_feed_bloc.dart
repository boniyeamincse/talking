import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/post_entity.dart';
import '../../domain/entities/comment_entity.dart';
import '../../domain/usecases/get_feed_usecase.dart';
import '../../domain/usecases/like_post_usecase.dart';
import '../../domain/usecases/create_post_usecase.dart';
import '../../domain/usecases/get_comments_usecase.dart';
import '../../domain/usecases/add_comment_usecase.dart';
import '../../domain/usecases/translate_content_usecase.dart';

part 'social_feed_event.dart';
part 'social_feed_state.dart';

class SocialFeedBloc extends Bloc<SocialFeedEvent, SocialFeedState> {
  final GetFeedUseCase getFeedUseCase;
  final LikePostUseCase likePostUseCase;
  final CreatePostUseCase createPostUseCase;
  final GetCommentsUseCase getCommentsUseCase;
  final AddCommentUseCase addCommentUseCase;
  final TranslateContentUseCase translateContentUseCase;

  int _currentPage = 1;

  SocialFeedBloc({
    required this.getFeedUseCase,
    required this.likePostUseCase,
    required this.createPostUseCase,
    required this.getCommentsUseCase,
    required this.addCommentUseCase,
    required this.translateContentUseCase,
  }) : super(SocialFeedInitial()) {
    on<LoadFeedEvent>(_onLoadFeed);
    on<LoadMorePostsEvent>(_onLoadMorePosts);
    on<LikePostEvent>(_onLikePost);
    on<UnlikePostEvent>(_onUnlikePost);
    on<ToggleTranslationEvent>(_onToggleTranslation);
    on<CreatePostEvent>(_onCreatePost);
    on<LoadCommentsEvent>(_onLoadComments);
    on<AddCommentEvent>(_onAddComment);
    on<LikeCommentEvent>(_onLikeComment);
    on<ToggleCommentTranslationEvent>(_onToggleCommentTranslation);
  }

  Future<void> _onLoadFeed(
    LoadFeedEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    if (event.refresh) {
      _currentPage = 1;
    }

    emit(SocialFeedLoading(isRefreshing: event.refresh));

    try {
      final result = await getFeedUseCase.call(GetFeedParams(page: _currentPage));
      
      result.fold(
        (failure) => emit(SocialFeedError(failure.message)),
        (posts) {
          if (state is SocialFeedLoaded && !event.refresh) {
            final currentPosts = (state as SocialFeedLoaded).posts;
            emit(SocialFeedLoaded(
              posts: [...currentPosts, ...posts],
              hasReachedMax: posts.isEmpty,
            ));
          } else {
            emit(SocialFeedLoaded(
              posts: posts,
              hasReachedMax: posts.isEmpty,
            ));
          }
          if (!event.refresh) _currentPage++;
        },
      );
    } catch (e) {
      emit(SocialFeedError('Failed to load feed: ${e.toString()}'));
    }
  }

  Future<void> _onLoadMorePosts(
    LoadMorePostsEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    if (state is SocialFeedLoaded && !(state as SocialFeedLoaded).hasReachedMax) {
      add(LoadFeedEvent());
    }
  }

  Future<void> _onLikePost(
    LikePostEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    if (state is! SocialFeedLoaded) return;

    final previousState = state as SocialFeedLoaded;
    emit(PostActionLoading(event.postId, previousState));

    try {
      final result = await likePostUseCase.call(LikePostParams(postId: event.postId));
      
      result.fold(
        (failure) => emit(previousState),
        (success) {
          final updatedPosts = previousState.posts.map((post) {
            if (post.id == event.postId) {
              return post.copyWith(
                isLiked: true,
                likesCount: post.likesCount + 1,
              );
            }
            return post;
          }).toList();

          emit(previousState.copyWith(posts: updatedPosts));
        },
      );
    } catch (e) {
      emit(previousState);
    }
  }

  Future<void> _onUnlikePost(
    UnlikePostEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    if (state is! SocialFeedLoaded) return;

    final previousState = state as SocialFeedLoaded;
    emit(PostActionLoading(event.postId, previousState));

    try {
      final result = await likePostUseCase.call(LikePostParams(postId: event.postId, unlike: true));
      
      result.fold(
        (failure) => emit(previousState),
        (success) {
          final updatedPosts = previousState.posts.map((post) {
            if (post.id == event.postId) {
              return post.copyWith(
                isLiked: false,
                likesCount: post.likesCount - 1,
              );
            }
            return post;
          }).toList();

          emit(previousState.copyWith(posts: updatedPosts));
        },
      );
    } catch (e) {
      emit(previousState);
    }
  }

  Future<void> _onToggleTranslation(
    ToggleTranslationEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    if (state is! SocialFeedLoaded) return;

    final currentState = state as SocialFeedLoaded;
    final post = currentState.posts.firstWhere((p) => p.id == event.postId);

    try {
      final result = await translateContentUseCase.call(
        TranslateContentParams(
          content: post.content,
          targetLanguage: 'en', // Default to English
        ),
      );

      result.fold(
        (failure) => emit(currentState),
        (translatedContent) {
          final updatedPosts = currentState.posts.map((p) {
            if (p.id == event.postId) {
              return p.copyWith(
                translatedContent: translatedContent,
                isTranslationEnabled: !p.isTranslationEnabled,
              );
            }
            return p;
          }).toList();

          emit(currentState.copyWith(posts: updatedPosts));
        },
      );
    } catch (e) {
      emit(currentState);
    }
  }

  Future<void> _onCreatePost(
    CreatePostEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    try {
      final result = await createPostUseCase.call(
        CreatePostParams(
          content: event.content,
          mediaFiles: event.mediaFiles,
          mediaTypes: event.mediaTypes,
        ),
      );

      result.fold(
        (failure) => emit(SocialFeedError(failure.message)),
        (newPost) {
          if (state is SocialFeedLoaded) {
            final currentState = state as SocialFeedLoaded;
            final updatedPosts = [newPost, ...currentState.posts];
            emit(currentState.copyWith(posts: updatedPosts));
          } else {
            emit(SocialFeedLoaded(posts: [newPost]));
          }
        },
      );
    } catch (e) {
      emit(SocialFeedError('Failed to create post: ${e.toString()}'));
    }
  }

  Future<void> _onLoadComments(
    LoadCommentsEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    emit(CommentsLoading(event.postId));

    try {
      final result = await getCommentsUseCase.call(GetCommentsParams(postId: event.postId));
      
      result.fold(
        (failure) => emit(SocialFeedError(failure.message)),
        (comments) => emit(CommentsLoaded(postId: event.postId, comments: comments)),
      );
    } catch (e) {
      emit(SocialFeedError('Failed to load comments: ${e.toString()}'));
    }
  }

  Future<void> _onAddComment(
    AddCommentEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    try {
      final result = await addCommentUseCase.call(
        AddCommentParams(
          postId: event.postId,
          content: event.content,
          parentId: event.parentId,
        ),
      );

      result.fold(
        (failure) => emit(SocialFeedError(failure.message)),
        (newComment) {
          if (state is CommentsLoaded && state.postId == event.postId) {
            final currentState = state as CommentsLoaded;
            final updatedComments = [newComment, ...currentState.comments];
            emit(CommentsLoaded(postId: event.postId, comments: updatedComments));
          }
        },
      );
    } catch (e) {
      emit(SocialFeedError('Failed to add comment: ${e.toString()}'));
    }
  }

  Future<void> _onLikeComment(
    LikeCommentEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    // Implementation for liking comments
    // Similar to post liking logic
  }

  Future<void> _onToggleCommentTranslation(
    ToggleCommentTranslationEvent event,
    Emitter<SocialFeedState> emit,
  ) async {
    // Implementation for comment translation
    // Similar to post translation logic
  }
}
