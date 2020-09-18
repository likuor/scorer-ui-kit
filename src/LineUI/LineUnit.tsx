import React from 'react';
import styled, { css } from 'styled-components';
import { IDragLineUISharedOptions } from './typings';


const ContrastLine = styled.line`
  pointer-events: none;
  stroke: hsla(205deg, 80%, 45%, 100%);
  mix-blend-mode: multiply;
`;

const HighlightLine = styled.line`
  pointer-events: none;
  stroke: hsla(205deg, 45%, 90%, 90%);
  // mix-blend-mode: multiply;
`;



const GrabHandle = styled.circle<{hide: boolean}>`
  fill: hsla(205deg, 45%, 90%, 100%);
  stroke: hsla(205deg, 45%, 100%, 100%);
  opacity: 1;
  transition: opacity 250ms ease;
  cursor: grab;

  ${props => props.hide && css`
    pointer-events: none;
    opacity: 0;
  `};
`;


const GrabHandleIndexGroup = styled.g<{showIndex: boolean}>`
  opacity: 0;
  pointer-events: none;
  ${props => props.showIndex && css`
    opacity: 1;
  `};

`;

const GrabHandleIndexText = styled.text<{showIndex: boolean}>`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  fill: hsla(205deg, 80%, 25%, 100%);
  text-align: center;

  font-weight: bold;
  transition: opacity 250ms ease;
  pointer-events: none;


`;

const LabelText = styled.text<{showIndex: boolean, styling: string}>`
  /* font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; */
  text-align: center;
  fill: ${({theme, styling}) => theme.colors.lines[styling].text.fill};
  font-weight: bold;
  transition: opacity 250ms ease;
  pointer-events: none;
`;

const GrabHandleContrast = styled(GrabHandle)`
  fill: none;
  stroke: hsla(205deg, 80%, 45%, 100%);

`;

const GrabHandleGroup = styled.g<{ showIndex: boolean, originalRadius: number}>`

  ${GrabHandle}, ${GrabHandleContrast} {
    transition: r 250ms ease;
  }

  ${props => props.showIndex && css`
    ${GrabHandle}, ${GrabHandleContrast} {
      pointer-events: none;
      r: ${props.originalRadius * 1.75};
    }
  `};
`;

interface ILineUnitProps {
  lineSetId: number,
  options: IDragLineUISharedOptions,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  unit: number,
  lineMoveCallback: any,
  lineMoveStartCallback: any
  moveEndCB?: () => void;
  label?: string;
  styling?: string;
}



const LineUnit : React.FC<ILineUnitProps> = (props) => {
  const { x1, y1, x2, y2, unit, lineMoveCallback, lineMoveStartCallback, options, lineSetId, label, styling='primary', moveEndCB=()=>{}} = props;
  const { handleFinderActive, revealSetIndex, showGrabHandle } = options;

  const a = x1 - x2;
  const b = y1 - y2;
  const distance = Math.sqrt( a*a + b*b );
  const hideGrabHandle = !showGrabHandle && distance < 60;


  /** --- Toucher Events Section --- */
  const grabTouchMove = (e: any) => {
    for (let i = 0; i < e.touches.length; i++) {
      // if(i === touchIndex){
        lineMoveCallback({ x: e.touches[i].pageX, y: e.touches[i].pageY});
      // }
    }
    moveEndCB();
  };

  const grabTouchStart = (e: any) => {
    for (let i = 0; i < e.touches.length; i++) {
    // if(i === touchIndex){
      lineMoveStartCallback({ x: e.touches[i].pageX, y: e.touches[i].pageY});
    // }
    }
  };


  /** --- Mouse Events Section --- */
  const handleMouseDown = (e: any) => {
    lineMoveStartCallback({ x: e.pageX, y: e.pageY});
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  };

  const handleMouseUp = (e: any) => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    lineMoveCallback({ x: e.pageX, y: e.pageY });
    moveEndCB();
    e.preventDefault();
  };

  const handleMouseMove = (e: any) => {
    lineMoveCallback({ x: e.pageX, y: e.pageY });
    e.preventDefault();
  };
  const midpoint = {
    x: (x2 + x1) / 2,
    y: (y2 + y1) / 2
  };
  return (
    <g>
      <ContrastLine strokeLinecap='round' x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={4 * unit} />
      <HighlightLine x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2 * unit} />

      <GrabHandleGroup showIndex={handleFinderActive && revealSetIndex} originalRadius={8 * unit}>
        <GrabHandleContrast r={8 * unit} strokeWidth={4 * unit} cx={midpoint.x} cy={midpoint.y} hide={hideGrabHandle} />
        <GrabHandle textAnchor='middle' r={8 * unit} strokeWidth={1 * unit} cx={midpoint.x} cy={midpoint.y} hide={hideGrabHandle} onTouchMove={grabTouchMove} onTouchStart={grabTouchStart} onMouseDown={handleMouseDown} />
      </GrabHandleGroup>

      <circle r={1* unit} cx={x1} cy={y1} fill='white' />
      <circle r={1* unit} cx={x2} cy={y2} fill='white' />

      <GrabHandleIndexGroup showIndex={!hideGrabHandle && (handleFinderActive || revealSetIndex)}>
        <GrabHandleIndexText fontSize={`${unit * 10}px`} x={midpoint.x - (3 * unit)} y={midpoint.y + (4 * unit)} showIndex={revealSetIndex || handleFinderActive}>
          {lineSetId}
        </GrabHandleIndexText>

      </GrabHandleIndexGroup>

      {
        label &&
          <LabelText styling={styling} fontSize={`${unit * 14}px`} x={midpoint.x - (16 * unit)} y={midpoint.y - (15 * unit)} showIndex={revealSetIndex || handleFinderActive}>
            {label}
          </LabelText>
      }
    </g>
  );

};

export default LineUnit;