import {
    GoogleMap, InfoBox, Marker, useJsApiLoader,
} from "@react-google-maps/api";
import { useDispatch, useSelector } from "react-redux";
import { Button, Image } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { IRoute } from "../../common/Interfaces";
import { AppDispatch, RootState } from "../../app/store";
import * as actionCreators from "./routeSlice";

interface RoutePreviewProps {

}

export default function RoutePreview(props : RoutePreviewProps) {
    const isMapLoading = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: "YOUR_API_KEY",
    }).isLoaded;

    const [isLoading, hasError, route] = useSelector<RootState, [boolean, boolean, IRoute|null]>((state) =>
        [state.route.isLoading, state.route.hasError, state.route.currentRoute]);
    const [overPlace, setOverPlace] = useState<number|null>(null);
    const history = useHistory();
    const dispatch = useDispatch<AppDispatch>();
    const params = useParams<{id : string}>();

    useEffect(() => {
        if (!route || route.repo_id !== parseInt(params.id)) {
            dispatch(actionCreators.fetchRoute(parseInt(params.id)));
        }
    }, [dispatch]);

    if (isLoading || isMapLoading || hasError) return null;
    if (!route) return <div>Fatal Error!</div>;
    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Route</h4>
                <div>
                    <Button
                        className="m-2"
                        id="delete-photo-button"
                        onClick={() => history.push("")}
                    >
                        View Detail
                    </Button>
                </div>
            </div>
            <div className="mt-2">
                <GoogleMap
                    mapContainerStyle={{ width: "400px", height: "400px" }}
                    onLoad={(map) => {
                        const sw = new window.google.maps.LatLng(route.region.south, route.region.west);
                        const ne = new window.google.maps.LatLng(route.region.north, route.region.east);
                        const bounds = new window.google.maps.LatLngBounds(sw, ne);
                        map.fitBounds(bounds);
                    }}
                    center={new window.google.maps.LatLng(route.region.latitude, route.region.longitude)}
                    zoom={8}
                >
                    {route.places.map((value) => (
                        <React.Fragment key={value.place_id.toString()}>
                            <Marker
                                position={{ lat: value.latitude, lng: value.longitude }}
                                onMouseOver={() => setOverPlace(value.place_id)}
                                onMouseOut={() => {
                                    if (overPlace === value.place_id) setOverPlace(null);
                                }}
                            >
                                { overPlace && overPlace === value.place_id && value.thumbnail && (
                                    <InfoBox>
                                        <Image src={value.thumbnail} alt={value.thumbnail} thumbnail />
                                    </InfoBox>
                                )}
                            </Marker>
                        </React.Fragment>
                    ))}
                </GoogleMap>
            </div>
        </div>
    );
}
