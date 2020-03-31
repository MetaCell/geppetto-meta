import React, {Component} from "react";
import BigImageViewer from "../../BigImageViewer";

export default class BigImageViewerExample extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const data = 'https://s3.amazonaws.com/patient-hm-august-2017/Histology/HM_1243_FLIPPED_DZ_tif.dzi';
        const styles = {
            left_third_column: 370,
            column_width_tree: 360,
            column_width_viewer: "calc(100% - 370px)",
            top: 0,
            height: "100%"
        };
        return (
            <div style={{position: 'relative'}}>
                <BigImageViewer
                    id="BigImageViewerContainer"
                    name={"BigImageViewer"}
                    data={data}
                    componentType={'BigImageViewer'}
                    ref={"viewer"}
                    size={{width: styles.column_width_viewer, height: styles.height, float: 'left'}}
                    position={{left: styles.left_third_column, top: styles.top}}
                />
            </div>
        );
    }
}