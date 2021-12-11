import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import {
    Carousel, CloseButton,
} from "react-bootstrap";
import {
    GoogleMap, Marker, Polyline, Rectangle, useJsApiLoader,
} from "@react-google-maps/api";
import {
    IPlace, IRegion, SetStateAction,
} from "../../../common/Interfaces";
import "./Travel.css";
import marker from "../../../common/assets/marker.gif";

interface TravelProps {
    repo_id : number;
    show : boolean;
    setShow : SetStateAction<boolean>;
}

export default function Travel(props : TravelProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    const [region, setRegion] = useState<IRegion|null>(null);
    const [places, setPlaces] = useState<IPlace[]>([]);
    const [index, setIndex] = useState<number>(0);
    const [placeIndex, setPlaceIndex] = useState<number>(0);
    const [map, setMap] = useState<any>(null);

    const isMapLoaded = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    }).isLoaded;

    useEffect(() => {
        if (props.show) {
            axios.get<any, AxiosResponse<{region: IRegion, route: IPlace[]}>>(
                `/api/repositories/${props.repo_id}/travel/`,
            )
                .then((response) => {
                    setIsLoading(false);
                    setPlaces(response.data.route);
                    setRegion(response.data.region);
                    setIndex(0);
                    setPlaceIndex(0);
                })
                .catch(() => {
                    setHasError(true);
                    setIsLoading(false);
                });
        }
    }, [props.show]);

    function onChange(selectedIndex : number) {
        setIndex(selectedIndex);
        let count = 0;
        for (let i = 0; i < places.length; i++) {
            if (count <= selectedIndex && selectedIndex < count + places[i].photos.length) {
                setPlaceIndex(i);
                break;
            }
            count += places[i].photos.length;
        }
    }

    if (!props.show) return null;

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div className="custom-modal">
            {isLoading || !isMapLoaded ? <h2 className="travel-loading">Loading...</h2> :
                hasError ? <h2 className="travel-loading">Not enough photos in this repository :(</h2> : (
                    <div>
                        <div className="travel-carousel" data-testid="travel-carousel">
                            <Carousel
                                className="travel-photo"
                                activeIndex={index}
                                indicators={false}
                                onSelect={onChange}
                                pause={false}
                            >
                                {places.length > 0 && places.reduce((a, b) =>
                                    ({ ...a, photos: [...a.photos, ...b.photos] }))
                                    .photos.map((photo) => (
                                        <Carousel.Item className="travel-photo" interval={3000}>
                                            <div className="w-100 h-100 travel-image-background">
                                                <img
                                                    className="travel-image"
                                                    src={photo.image}
                                                    alt={photo.image}
                                                />
                                            </div>
                                        </Carousel.Item>
                                    ))}
                            </Carousel>
                        </div>
                        {region && (
                            <div className="travel-minimap">
                                <GoogleMap
                                    mapTypeId="257d559a76ad5fe6"
                                    mapContainerStyle={{ width: "100%", height: "100%" }}
                                    onLoad={(map) => {
                                        const sw = new window.google.maps.LatLng(region.south, region.west);
                                        const ne = new window.google.maps.LatLng(region.north, region.east);
                                        const bounds = new window.google.maps.LatLngBounds(sw, ne);
                                        map.fitBounds(bounds, 0);
                                        window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
                                            map.setZoom(map.getZoom() as number - 1);
                                        });
                                        setMap(map);
                                    }}
                                    center={new window.google.maps.LatLng(region.latitude, region.longitude)}
                                    options={{
                                        fullscreenControl: false,
                                        gestureHandling: "none",
                                        zoomControl: false,
                                        mapId: "257d559a76ad5fe6",
                                        streetViewControl: false,
                                        scaleControl: false,
                                        mapTypeControl: false,
                                    }}
                                >
                                    {map && (
                                        <div>
                                            <Rectangle
                                                bounds={map.getBounds()}
                                                options={{
                                                    fillOpacity: 0.3,
                                                    fillColor: "#000000",
                                                    strokeWeight: 0,
                                                }}
                                            />
                                            <Marker
                                                icon={marker}
                                                position={{
                                                    lat: places[placeIndex].latitude -
                                                    (map.getBounds()?.getNorthEast().lat() -
                                                        map.getBounds()?.getSouthWest().lat()) /
                                                    (window.innerHeight / 80),
                                                    lng: places[placeIndex].longitude,
                                                }}
                                            />
                                            <Polyline
                                                path={places.map((value) => ({
                                                    lat: value.latitude,
                                                    lng: value.longitude,
                                                }))}
                                                options={{
                                                    strokeColor: "#FF66E4",
                                                    strokeOpacity: 1,
                                                    strokeWeight: 2,
                                                }}
                                            />
                                        </div>
                                    )}
                                </GoogleMap>
                            </div>
                        )}
                    </div>
                )}
            <CloseButton
                variant="white"
                className="travel-close-button m-2"
                onClick={() => props.setShow(false)}
            />
        </div>
    );
}
