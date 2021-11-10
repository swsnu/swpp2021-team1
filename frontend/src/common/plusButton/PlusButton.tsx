import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";
import "./PlusButton.css";

interface PlusButtonProps {
    linkTo: string
}

const PlusButton = (props: PlusButtonProps) => {
    const { linkTo } = props;
    return (
        <Link to={linkTo} className="float pt-3">
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 40, textAlign: "center" }} />
        </Link>
    );
};

export default PlusButton;
