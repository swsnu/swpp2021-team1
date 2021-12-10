import PhotoPreview from "../../photo/PhotoPreview";
import DiscussionPreview from "../../discussion/DiscussionPreview";
import PostPreview from "../../post/PostPreview";
import RoutePreview from "../../route/RoutePreview";

// suppress tsx-no-component-props
export default function Group() {
    return (
        <div>
            <RoutePreview />
            <PhotoPreview />
            <PostPreview />
            <DiscussionPreview />
        </div>
    );
}
