import PhotoPreview from "../../photo/PhotoPreview";
import DiscussionPreview from "../../discussion/DiscussionPreview";
import PostPreview from "../../post/PostPreview";
import RoutePreview from "../../route/RoutePreview";
import {useSelector} from "react-redux";
import {RootState} from "../../../app/store";
import {IRepository, IUser} from "../../../common/Interfaces";

interface GroupProps {

}

export default function Group(props : GroupProps) {
    return (
        <div>
            <RoutePreview />
            <PhotoPreview />
            <PostPreview />
            {/* TODO : 권한 있을 때만 Discussion 열람 가능 */}
            <DiscussionPreview />
        </div>
    );
}
