import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import React from "react";

const Rating = ({ value = 4 }) => {

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`shrink-0 text-sm ${value > i ? "text-green-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
};

export default Rating;