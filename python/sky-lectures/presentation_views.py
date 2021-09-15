class PresentationViewSet(ModelViewSet):
    queryset = Presentation.objects.all()
    serializer_class = OutputPresentationSerializer
    permission_classes = [IsAdminOrOwner]
    filterset_class = PresentationFilter
    pagination_class = StandardResultsSetPagination
    search_fields = ["title", "description", "user__username", "tags__name"]
    ordering_fields = ["scheduled_on", "title", "user__username"]

    def create(self, request, *args, **kwargs):
        service = PresentationService()
        serializer = InputPresentationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        presentation = PresentationService().create_presentation(
            presentation_data=serializer.validated_data
            user=request.user
        )

        return Response(
            data=self.get_serializer(presentation).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        service = PresentationService()
        partial = kwargs.pop("partial", False)
        presentation = self.get_object()
        serializer = InputPresentationSerializer(
            instance=presentation, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        presentation = PresentationService().update_presentation(
            presentation=presentation,
            presentation_data=serializer.validated_data,
            partial=partial,
        )

        return Response(
            data=self.get_serializer(presentation).data, status=status.HTTP_200_OK
        )


class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = StandardResultsSetPagination


class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [
        IsAdminOrOwner,
    ]
    http_method_names = ["get", "post", "put", "patch"]

    def perform_create(self, serializer):
        CommentService().set_comment_user(serializer=serializer, user=self.request.user)

    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        serializer = CommentUpdateSerializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        comment = CommentService().update_comment(
            comment=comment, validated_data=serializer.validated_data
        )

        return Response(
            data=self.get_serializer(comment).data, status=status.HTTP_200_OK
        )
