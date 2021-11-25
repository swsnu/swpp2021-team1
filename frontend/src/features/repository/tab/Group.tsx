import PhotoPreview from "../../photo/PhotoPreview";
import DiscussionPreview from "../../discussion/DiscussionPreview";
import PostPreview from "../../post/PostPreview";
import RoutePreview from "../../route/RoutePreview";

interface GroupProps {

}

export default function Group(props : GroupProps) {
    return (
        <div>
            <RoutePreview />
            <PhotoPreview />
            <PostPreview />
            <DiscussionPreview />
        </div>
    );
}
