import React, { Component } from 'react'
import Card from '@mui/material/Card';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import IconButtonWithTooltip from "../../common/IconButtonWithTooltip";
import { Matrix } from "../layouts/Matrix";
import { Force } from "../layouts/Force";
import { Hive } from "../layouts/Hive";
import { Chord } from "../layouts/Chord";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import MatrixImg from '../images/matrix.svg';
import ForceImg from '../images/force.svg';
import HiveImg from '../images/hive.svg';
import ChordImg from '../images/chord.svg';

const classes = {
  cardDeckWrapper: "connectivity-deck-wrapper",
  cardWrapperTitle: "connectivity-deck-title",
  cardDeck: "connectivity-deck-card-deck",
  card: "connectivity-deck-card",
  img: "connectivity-deck-card-img",
  cardText: "connectivity-deck-card-text",
  cardTitle: "connectivity-deck-card-title",
  cardAction: "connectivity-deck-card-action",
  cardImgTopCenterBlock: "connectivity-deck-card-img-top-center-block",
  cardActionDisabled: "connectivity-deck-card-action-disabled",
  button: "connectivity-deck-button",
};


class ConnectivityDeck extends Component {
  constructor (props) {
    super(props);
    this.state = { open: false };
    this.deck = [
      {
        title: "Adjacency matrix",
        subtitle: "A coloured square at row 𝒊, column 𝒋 represents a directed connection from node 𝒋 to node 𝒊.",
        handler: this.props.handler.bind(this, new Matrix()),
        disabled: false,
        img: MatrixImg
      },
      {
        title: "Force-directed layout",
        subtitle: "Draw circles for nodes, lines for connections, disregarding spatial information. ",
        handler: this.props.handler.bind(this, new Force()),
        disabled: false,
        img: ForceImg

      },
      {
        title: "Hive plot",
        subtitle: "Axes correspond to node categories, arcs to connections."
                    + "The position of each node along an axis is determined by "
                    + "the total number of connections it makes.",
        handler: this.props.handler.bind(this, new Hive(true)),
        disabled: false,
        img: HiveImg
      },
      {
        title: "Chord diagram",
        subtitle: "Circular slices correspond to node categories, chords to "
                    + "connections. A gap between slice and chord indicate an "
                    + "incoming connection. Use ctrl(shift) + mouse hover to "
                    + "hide incoming(outgoing) connections from a population.",
        handler: this.props.handler.bind(this, new Chord(false)),
        disabled: false,
        img: ChordImg
      },
    ];
  }

  render () {
    const { open } = this.state;

    return (
      <span>
        <IconButtonWithTooltip
          disabled={false}
          onClick={() => this.setState({ open: true })}
          className={classes.button}
          icon={faCog}
          tooltip={"Open layout selector"}
        />
        <Modal
          open={open}
          disableAutoFocus
          onClose={() => this.setState({ open: false })}
        >
          <div className={classes.cardDeckWrapper}>
            <p className={classes.cardWrapperTitle}>How would you like to represent your network?</p>
            <div className={classes.cardDeck}>
              {this.deck.map(({ title, subtitle, handler, disabled, img }) => (
                <Card raised className={classes.card} key={title}>
                  <CardActionArea
                    className={disabled ? classes.cardActionDisabled : classes.cardAction}
                    onClick={() => {
                      handler();
                      this.setState({ open: false })
                    }}
                    disabled={disabled}
                  >
                    <CardContent className={classes.cardText}>
                      <img className={classes.cardImgTopCenterBlock} src={img}/>
                      <Typography className={classes.cardTitle} variant="h5">
                        {title}
                      </Typography>
                      <Typography component="p">
                        {subtitle}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </div>
          </div>
        </Modal>
      </span>
    )
  }
}

export default ConnectivityDeck;
