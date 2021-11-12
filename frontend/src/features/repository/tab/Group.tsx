import PhotoPreview from "../../photo/PhotoPreview";
import DiscussionPreview from "../../discussion/DiscussionPreview";
import PostPreview from "../../post/PostPreview";

interface GroupProps {

}

export default function Group(props : GroupProps) {
    return (
        <div>
            <PhotoPreview />
            <PostPreview />
            <DiscussionPreview />
        </div>
    );
}
