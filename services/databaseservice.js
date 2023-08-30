const bcrypt = require("bcrypt");
const { response } = require("express");

const { User, Academics } = require("../middleware/databaseconnection.js");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
async function signupService(data) {
  let encryptedPassword = bcrypt.hashSync(data.password, 10);

  let response;

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    emailId: data.emailId,
    password: encryptedPassword,
    role: data.role,
    publicKey: data.publicKey,
    privateKey: data.privateKey,
    accountId: data.accountId,
  })
    .then(function (item) {
      const token = jwt.sign(
        { user_id: item.id, email: item.emailId },
        process.env.JWT_TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      item.update({
        token: token,
      });
      console.log(item.id);
      // item.token = token;
      response = {
        message: "Item Created",
        status: 200,
        token: token,
        id: item.id,
      };
    })
    .catch((error) => {
      console.log("FROM ERROR");
      console.log(error);

      response = { message: error, status: 501 };
    });

  // console.log(await response);
  return await response;
}
async function addAcademicData(data) {
  const user = await Academics.create({
    studentId: data.studentId,
    degree: data.degree,
    schoolName: data.schoolName,
    division: data.division,
    year: data.year,
  })
    .then(() => {
      console.log("Student academic data Created");
    })
    .catch((error) => {
      console.log(error);
    });
  return response;
}
async function loginService(emailId, password) {
  let response;

  let user = await User.findOne({
    where: {
      emailId: emailId,
    },
  });

  if (!user) response = { status: 404 };
  else {
    let passwordCompare = bcrypt.compareSync(password, user.password);

    if (passwordCompare) {
      console.log("JWTT");
      const token = jwt.sign(
        { user_id: user.id, email: user.emailId },
        process.env.JWT_TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.update({
        token: token,
      });

      response = { token: token, status: 200 };
    } else {
      response = { status: 401 };
    }
  }

  return response;
}

async function searchService(query, queryType) {
  let data;
  if (queryType == 0) {
    data = await User.findAll({
      where: {
        emailId: {
          [Op.like]: `%${query}%`,
        },
      },
    });
  } else if (queryType == 1) {
    data = await User.findAll({
      where: {
        firstName: {
          [Op.like]: `%${query}%`,
        },
      },
    });
  } else {
    data = await User.findAll({
      where: {
        lastName: {
          [Op.like]: `%${query}%`,
        },
      },
    });
  }
  // console.log("INSIDE SEARCH");

  return data;
}

async function certService(id) {
  let data = await Academics.findOne({
    where: {
      studentId: id,
    },
  });
  return data;
}

async function rowService(id) {
  let data = await User.findOne({
    where: {
      id: id,
    },
  });
  return data;
}

module.exports = {
  signupService,
  loginService,
  searchService,
  certService,
  addAcademicData,
  rowService,
};
