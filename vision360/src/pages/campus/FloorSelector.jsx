import React from "react";

export default function FloorSelector({ selectedFloor, onSelectFloor }) {
    const floors = [
        { id: "ground", label: "rez de chaussee" },
        { id: "first", label: "1er etage", sub: "er" },
        { id: "second", label: "2e etage", sub: "e" },
    ];

    return (
        <div className="campus-floorTabsWrapper">
            <div className="campus-floorTabs">
                {floors.map((floor) => (
                    <button
                        key={floor.id}
                        type="button"
                        className={selectedFloor === floor.id ? "campus-floorBtn active" : "campus-floorBtn"}
                        onClick={() => onSelectFloor(floor.id)}
                    >
                        {floor.id === "ground" ? (
                            floor.label
                        ) : (
                            <>
                                {floor.id === "first" ? "1" : "2"}
                                <sup>{floor.sub}</sup> etage
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
