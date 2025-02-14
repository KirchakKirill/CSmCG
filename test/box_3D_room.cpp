#include <iostream>
#include "include/GL/freeglut.h"

using namespace std;



double rotate_y = 0;
double rotate_x = 0;

void specialKeys(int key, int x, int y)
{
    
    if (key == GLUT_KEY_RIGHT)
        rotate_y += 5;

    else if (key == GLUT_KEY_LEFT)
        rotate_y -= 5;

    else if (key == GLUT_KEY_UP)
        rotate_x += 5;

    else if (key == GLUT_KEY_DOWN)
        rotate_x -= 5;


    glutPostRedisplay();
}

void update(int value) {
    rotate_x += 1;
    if (rotate_x > 360) rotate_x -= 360;

    rotate_y += 1;
    if (rotate_y > 360) rotate_y -= 360;


    glutPostRedisplay();
    glutTimerFunc(16, update, 0);
}

void display() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


    glLoadIdentity();

    glRotatef(rotate_x, 1.0, 0.0, 0.0);
    glRotatef(rotate_y, 0, 1.0, 0.0);
    

    

    
    GLfloat vertices[8][3] = {
        {-0.5, -0.5, -0.5}, {-0.5, 0.5, -0.5},
        {0.5, 0.5, -0.5}, {0.5, -0.5, -0.5},
        {-0.5, -0.5, 0.5}, {-0.5, 0.5, 0.5},
        {0.5, 0.5, 0.5}, {0.5, -0.5, 0.5}
    };

    
    GLint faces[6][4] = {
        {0, 1, 2, 3}, 
        {4, 5, 6, 7}, 
        {0, 3, 7, 4}, 
        {1, 2, 6, 5}, 
        {0, 1, 5, 4}, 
        {3, 2, 6, 7} 
    };

    
    GLfloat colors[6][3] = {
        {1.0, 0.0, 0.0}, 
        {0.0, 1.0, 0.0},
        {0.0, 0.0, 1.0},
        {1.0, 1.0, 0.0},
        {1.0, 0.0, 1.0},
        {0.0, 1.0, 1.0}
    };

    
    for (int i = 0; i < 6; i++) {
        glBegin(GL_POLYGON);
        glColor3fv(colors[i]); 
        for (int j = 0; j < 4; j++) {
            glVertex3fv(vertices[faces[i][j]]);
        }
        glEnd();
    }

    glFlush();
    glutSwapBuffers();
}

int main(int argc, char** argv)
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(640, 480);
    glutCreateWindow("FreeGLUT Test");
    glEnable(GL_DEPTH_TEST);
    glutDisplayFunc(display);
    glutSpecialFunc(specialKeys);
    //glutTimerFunc(16, update, 0);
    glutMainLoop();
    return 0;
    
    return 0;
}