import { createAsyncThunk } from "@reduxjs/toolkit";
import React from "react";
import { ListGroup, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { getFriends } from "../../../common/APIs";
import { IUser } from "../../../common/Interfaces";
import Friend from "../Friend";

interface FriendListProps {
    modalShow: boolean
    handleClose(): void
    friendList: IUser[]
    currentUser: string
}

export default function FriendList(props : FriendListProps) {
    const { modalShow, handleClose, currentUser } = props;

    return (
        <Modal show={modalShow} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {currentUser}
                    {currentUser.match(/s$/) ? "' friends" : "'s friends"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {props.friendList.map((friend) => <Friend friend={friend} />)}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
}
