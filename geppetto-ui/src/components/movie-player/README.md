# Movie Player Component

React component for playing videos.

The components loads media from an URL passed to the component as a property.
THe 'react-player' library is used to load the media, which can be from different sources such as:
YouTube, Facebook, Twitch, SoundCloud, Streamable, Vimeo, and Mixcloud 

[Movie Player Component](./MoviePlayer.js)

### Component Properties

- **controls**: Object (Optional)
	Javascript object with playback settings.
	```
	{
		playAtStart: false,
		loop: false,
		volume: 1,
		playbackRate: 1,
	}
	```

- **videoURL** : String (Required)
	URL pointing to the video to be render in this component. 
- **width** : String (Optional)
	Width of the movie player
- **height** : String (Optional)
	Height of the movie player

## Example

[Movie Player Example](./showcase/examples/MoviePlayerShowcase.js)

```javascript

import React, { Component } from "react";
import MoviePlayer from "./../MoviePlayer";

export default class MoviePlayerShowcase extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        const controls = {
            playAtStart: false,
            loop: false,
            volume: 1,
            playbackRate: 1,
        };
        const videoURL = "https://youtu.be/OmwXCGPBhNo";
        const width = "100%";
        const height = "640px";

        return (
            <MoviePlayer
                controls={controls}
                videoURL={videoURL}
                width={width}
                height={height}
            />
        );
    }
}
```

## Libraries

[React](https://www.npmjs.com/package/react)
[ReactPlayer](https://www.npmjs.com/package/react-player)