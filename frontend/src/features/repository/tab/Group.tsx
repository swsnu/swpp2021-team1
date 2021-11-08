import PhotoPreview from "../../photo/PhotoPreview";
import DiscussionPreview from "../../discussion/DiscussionPreview";

interface GroupProps {

}

export default function Group(props : GroupProps) {
    return (
        <div>
            <PhotoPreview />
            <DiscussionPreview />
        </div>
    );
}
