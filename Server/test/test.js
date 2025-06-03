const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const User = require('../model/schema/user');
const Meeting = require('../model/schema/meeting');

chai.use(chaiHttp);

// Import the server after setting up the test environment
process.env.NODE_ENV = 'test';
const app = require('../index');

let authToken = '';
let testUserId = '';
let testMeetingId = '';

describe('API Tests', function() {
    this.timeout(10000); // Increase timeout for database operations

    before(async function() {
        // Wait for database connection
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    describe('User Authentication', function() {
        it('should login with valid credentials', function(done) {
            const loginData = {
                username: 'admin@gmail.com',
                password: 'admin123'
            };

            chai.request(app)
                .post('/api/user/login')
                .send(loginData)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('token');
                    res.body.should.have.property('user');
                    authToken = res.body.token;
                    testUserId = res.body.user._id;
                    done();
                });
        });

        it('should not login with invalid credentials', function(done) {
            const loginData = {
                username: 'invalid@gmail.com',
                password: 'wrongpassword'
            };

            chai.request(app)
                .post('/api/user/login')
                .send(loginData)
                .end(function(err, res) {
                    res.should.have.status(401);
                    res.body.should.have.property('error');
                    done();
                });
        });
    });

    describe('Meeting API', function() {
        it('should create a new meeting', function(done) {
            const meetingData = {
                agenda: 'Test Meeting',
                location: 'Conference Room A',
                dateTime: '2024-01-15T10:00:00Z',
                notes: 'This is a test meeting',
                related: 'Project Discussion'
            };

            chai.request(app)
                .post('/api/meeting/add')
                .set('Authorization', authToken)
                .send(meetingData)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.should.have.property('meeting');
                    testMeetingId = res.body.meeting._id;
                    done();
                });
        });

        it('should get all meetings', function(done) {
            chai.request(app)
                .get('/api/meeting/')
                .set('Authorization', authToken)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it('should get a meeting by id', function(done) {
            chai.request(app)
                .get('/api/meeting/view/' + testMeetingId)
                .set('Authorization', authToken)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('agenda');
                    done();
                });
        });

        it('should update a meeting', function(done) {
            const updatedData = {
                agenda: 'Updated Test Meeting',
                location: 'Conference Room B',
                dateTime: '2024-01-15T14:00:00Z',
                notes: 'This is an updated test meeting'
            };

            chai.request(app)
                .put('/api/meeting/edit/' + testMeetingId)
                .set('Authorization', authToken)
                .send(updatedData)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('should delete a meeting', function(done) {
            chai.request(app)
                .delete('/api/meeting/delete/' + testMeetingId)
                .set('Authorization', authToken)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.have.property('message');
                    done();
                });
        });

        it('should not access meetings without authentication', function(done) {
            chai.request(app)
                .get('/api/meeting/')
                .end(function(err, res) {
                    res.should.have.status(401);
                    res.body.should.have.property('message');
                    done();
                });
        });
    });
});