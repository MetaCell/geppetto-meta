import React, {Component} from "react";
import BigImageViewer from "../../BigImageViewer";

export default class BigImageViewerExample extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const data = 'https://s3.amazonaws.com/patient-hm-august-2017/Histology/HM_1243_FLIPPED_DZ_tif.dzi';
        return (
            <div style={{position: 'relative'}}>
                <BigImageViewer
                    id="BigImageViewerContainer"
                    name={"BigImageViewer"}
                    data={data}
                    componentType={'BigImageViewer'}
                    ref={"viewer"}
                />
            </div>
        );
    }
}