import { Clouds, Cloud } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { Vector3, MeshStandardMaterial, MeshBasicMaterial } from 'three';

const MovingClouds = () => {
    const { theme } = useTheme();
    const { viewport } = useThree();

    const logoSize = Math.min( viewport.width, viewport.height ) * 0.8;
    const edgeBuffer = logoSize * 0.1;

    const cloudPositions = useMemo( () => {
        return Array.from( { length: 15 } ).map( () => {
            const x = ( Math.random() - 0.5 ) * ( logoSize - edgeBuffer * 2 );
            const y = ( Math.random() - 0.5 ) * ( logoSize - edgeBuffer * 2 );
            const z = Math.random() * -10 - 5;
            return new Vector3( x, y, z );
        } );
    }, [ logoSize, edgeBuffer ] );

    const getOpacity = ( position: Vector3 ) => {
        const distanceFromCenter = Math.sqrt( position.x ** 2 + position.y ** 2 );
        const maxDistance = logoSize / 2 - edgeBuffer;
        return Math.max( 0, 1 - distanceFromCenter / maxDistance );
    };



    return (
        <Clouds>
            { cloudPositions.map( ( position, i ) => (
                <Cloud
                    key={ i }
                    position={ position }
                    color={ theme === 'dark' ? 'white' : 'black' }
                    opacity={ getOpacity( position ) }
                    volume={ Math.random() * 0.5 + 0.5 }
                    fade={ 10 }
                    speed={ 0.1 }
                    matrixWorldNeedsUpdate
                    growth={ 1 }
                    segments={ 20 }
                    bounds={ [ 3, 1, 1 ] }
                    concentrate="inside"
                />
            ) ) }
        </Clouds>
    );
};

export default MovingClouds;