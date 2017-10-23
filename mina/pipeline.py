from mina.models import Profile


def get_profile_data(backend, details, response, uid, user, *args, **kwargs):
    if user.profile:
        if backend.__class__.__name__ == 'FacebookOAuth2':
            if not user.profile.login_type:
                user.profile.login_type = 'Facebook'
            if not user.profile.locale and response.get('locale'):
                user.profile.locale = response.get('locale')
            if not user.profile.social_id and response.get('id'):
                user.profile.social_id = response.get('id')
            user.save()
        if backend.__class__.__name__ == 'GoogleOAuth2':
            if not user.profile.login_type:
                user.profile.login_type = 'Google'
            if not user.profile.locale and response.get('locale'):
                user.profile.locale = response.get('locale')
            if not user.profile.social_id and response.get('id'):
                user.profile.social_id = response.get('id')
            user.save()


# TODO: change this algorithm to look better


def get_profile_avatar(backend, details, response,
                       uid, user, *args, **kwargs):
    url = None
    # CONCURRENT PROBLEM, FIX LATER
    # profile = user.profile
    # profile.profile_photo.delete(False)
    # if backend.__class__.__name__ == 'FacebookOAuth2':
    #     url = "http://graph.facebook.com/%s/picture?type=large" % \
    #           response.get('id')
    #
    # if backend.__class__.__name__ == 'GoogleOAuth2':
    #     url = response.get('image').get('url')
    #     url = url.replace('sz=50', 'sz=200')
    # if url:
    #     try:
    #         avatar = urlopen(url)
    #         rstring = uuid4().hex
    #         profile.profile_photo.save(slugify(rstring + '_p') + '.jpg',
    #                                    ContentFile(avatar.read()))
    #         profile.save()
    #     except HTTPError:
    #         pass


def check_if_profile_exist(backend, details, response, uid, user, *args, **kwargs):
    if not hasattr(user, 'profile'):
        Profile.objects.create(user=user)
